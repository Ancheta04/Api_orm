const db = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

// Get all departments
async function getAll() {
    return await db.Department.findAll();
}

// Get department by ID
async function getById(id) {
    return await getDepartment(id);
}

// Create new department
async function create(params) {
    // Check if department name already exists
    if (await db.Department.findOne({ where: { name: params.name } })) {
        throw `Department "${params.name}" already exists`;
    }

    const department = new db.Department(params);
    await department.save();
    return department;
}

// Update department details
async function update(id, params) {
    const department = await getDepartment(id);

    // Check if name is changing and already exists
    if (
        params.name &&
        params.name !== department.name &&
        await db.Department.findOne({ where: { name: params.name } })
    ) {
        throw `Department "${params.name}" already exists`;
    }

    Object.assign(department, params);
    department.updated = Date.now();
    await department.save();

    return department;
}

// Delete department
async function _delete(id) {
    const department = await getDepartment(id);
    await department.destroy();
}

// Helper function
async function getDepartment(id) {
    const department = await db.Department.findByPk(id);
    if (!department) throw 'Department not found';
    return department;
}
