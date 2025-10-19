const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        // Basic employee info
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING, allowNull: false },

        // Employee-specific fields
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        position: { type: DataTypes.STRING, allowNull: true },
        department: { type: DataTypes.STRING, allowNull: true },

        // Role and status
        role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Employee' },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

        // Verification & security
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE },

        // Tracking info
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },

        // Virtual fields
        isVerified: {
            type: DataTypes.VIRTUAL,
            get() {
                return !!(this.verified || this.passwordReset);
            }
        }
    };

    const options = {
        timestamps: false, // disables Sequelize's automatic createdAt/updatedAt
        defaultScope: {
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            withHash: { attributes: {} }
        }
    };

    return sequelize.define('employee', attributes, options);
}
