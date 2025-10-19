const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        // Basic position info
        title: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true 
        },
        description: { 
            type: DataTypes.STRING, 
            allowNull: true 
        },
        department: { 
            type: DataTypes.STRING, 
            allowNull: true 
        },

        // How many employees hold this position
        employeeCount: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            defaultValue: 0 
        },

        // Tracking info
        created: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updated: { 
            type: DataTypes.DATE 
        }
    };

    const options = {
        timestamps: false
    };

    return sequelize.define('Position', attributes, options);
}
