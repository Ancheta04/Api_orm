const db = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

// Get all positions
async function getAll() {
    return await db.Position.findAll();
}

// Get position by ID
async function getById(id) {
    return await getPosition(id);
}

// Create new position
async function create(params) {
    // Check if title already exists
    if (await db.Position.findOne({ where: { title: params.title } })) {
        throw `Position "${params.title}" already exists`;
    }

    const position = new db.Position(params);
    await position.save();
    return position;
}

// Update existing position
async function update(id, params) {
    const position = await getPosition(id);

    // Validate title uniqueness if changed
    if (
        params.title &&
        params.title !== position.title &&
        await db.Position.findOne({ where: { title: params.title } })
    ) {
        throw `Position "${params.title}" already exists`;
    }

    Object.assign(position, params);
    position.updated = Date.now();
    await position.save();

    return position;
}

// Delete a position
async function _delete(id) {
    const position = await getPosition(id);
    await position.destroy();
}

// Helper
async function getPosition(id) {
    const position = await db.Position.findByPk(id);
    if (!position) throw 'Position not found';
    return position;
}
