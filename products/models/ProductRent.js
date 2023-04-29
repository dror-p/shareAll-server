const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");
const EntitySchema = new Schema(
    {
        from: {type: Date},
        to: {type: Date},
        //TODO: add user entity
        product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
        //TODO: use user entity- [user, ownership_percent]
        user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        status:{type: String}
    },
    {timestamps: true}
);

module.exports = mongoose.model("ProductRent", EntitySchema);
