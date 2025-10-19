const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

// =========================
// AUTHENTICATION
// =========================
async function authenticate({ email, password, ipAddress }) {
    const employee = await db.Employee.scope('withHash').findOne({ where: { email } });

    if (!employee || !employee.isVerified || !bcrypt.compareSync(password, employee.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(employee);
    const refreshToken = generateRefreshToken(employee, ipAddress);

    await refreshToken.save();

    return {
        ...basicDetails(employee),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

// =========================
// REGISTER / VERIFY
// =========================
async function register(params, origin) {
    if (await db.Employee.findOne({ where: { email: params.email } })) {
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    const employee = new db.Employee(params);

    const isFirstEmployee = (await db.Employee.count()) === 0;
    employee.role = isFirstEmployee ? Role.Admin : Role.User;
    employee.verificationToken = randomTokenString();
    employee.passwordHash = await hash(params.password);

    await employee.save();
    await sendVerificationEmail(employee, origin);
}

async function verifyEmail(token) {
    const employee = await db.Employee.findOne({ where: { verificationToken: token } });

    if (!employee) throw 'Verification failed';

    employee.verified = Date.now();
    employee.verificationToken = null;
    await employee.save();
}

// =========================
// PASSWORD RESET
// =========================
async function forgotPassword({ email }, origin) {
    const employee = await db.Employee.findOne({ where: { email } });
    if (!employee) return;

    employee.resetToken = randomTokenString();
    employee.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await employee.save();

    await sendPasswordResetEmail(employee, origin);
}

async function validateResetToken({ token }) {
    const employee = await db.Employee.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!employee) throw 'Invalid token';
    return employee;
}

async function resetPassword({ token, password }) {
    const employee = await validateResetToken({ token });
    employee.passwordHash = await hash(password);
    employee.passwordReset = Date.now();
    employee.resetToken = null;
    await employee.save();
}

// =========================
// CRUD OPERATIONS
// =========================
async function getAll() {
    const employees = await db.Employee.findAll();
    return employees.map(x => basicDetails(x));
}

async function getById(id) {
    const employee = await getEmployee(id);
    return basicDetails(employee);
}

async function create(params) {
    if (await db.Employee.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const employee = new db.Employee(params);
    employee.verified = Date.now();
    employee.passwordHash = await hash(params.password);
    await employee.save();

    return basicDetails(employee);
}

async function update(id, params) {
    const employee = await getEmployee(id);

    if (params.email && employee.email !== params.email && await db.Employee.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already taken`;
    }

    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    Object.assign(employee, params);
    employee.updated = Date.now();
    await employee.save();

    return basicDetails(employee);
}

async function _delete(id) {
    const employee = await getEmployee(id);
    await employee.destroy();
}

// =========================
// HELPERS
// =========================
async function getEmployee(id) {
    const employee = await db.Employee.findByPk(id);
    if (!employee) throw 'Employee not found';
    return employee;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(employee) {
    return jwt.sign({ sub: employee.id, id: employee.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(employee, ipAddress) {
    return new db.RefreshToken({
        employeeId: employee.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(employee) {
    const { id, email, role, created, updated, isVerified } = employee;
    return { id, email, role, created, updated, isVerified };
}

// =========================
// EMAIL HELPERS
// =========================
async function sendVerificationEmail(employee, origin) {
    let message;
    const verifyUrl = `${origin}/employee/verify-email?token=${employee.verificationToken}`;

    if (origin) {
        message = `<p>Please click the below link to verify your email:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use this token to verify your email via the API route:</p>
                   <p><code>${employee.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: employee.email,
        subject: 'Employee Verification',
        html: `<h4>Verify Email</h4><p>Thanks for registering!</p>${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you forgot your password, visit the <a href="${origin}/employee/forgot-password">Forgot Password</a> page.</p>`;
    } else {
        message = `<p>If you forgot your password, reset it via the <code>/employee/forgot-password</code> API route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Email Already Registered',
        html: `<h4>Email Already Registered</h4><p>Your email <strong>${email}</strong> is already registered.</p>${message}`
    });
}

async function sendPasswordResetEmail(employee, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/employee/reset-password?token=${employee.resetToken}`;
        message = `<p>Click the below link to reset your password (valid for 1 day):</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Use this token to reset your password via the API route:</p>
                   <p><code>${employee.resetToken}</code></p>`;
    }

    await sendEmail({
        to: employee.email,
        subject: 'Reset Password',
        html: `<h4>Reset Password</h4>${message}`
    });
}
