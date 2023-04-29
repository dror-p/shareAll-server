const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");
const EntitySchema = new Schema(
    {
        name: {type: String},
        productType: {
            type: String,
            enum: ['rent', 'buyGlobal'],
            default: 'rent'
        },
        status: {
            type: String,
            enum: ['available', 'not available'],
            default: 'available'
        },
        category: {type: String},
        area: {type: String},
        city: {type: String},
        long: {type: String},
        lat: {type: String},
        price_from: {type: Number},
        price_to: {type: Number},
        tags: [{type: String}],
        description: {type: String},
        photos: [{type: String}],
        max_number_of_buyers: Number,
        dailyPayment: {type: Number},
        hourlyPayment: {type: Number},
        //TODO: add user entity
        manager: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
        //TODO: use user entity- [user, ownership_percent]
        users: [{type: String}],
        watches: {type: Number, default: 0},
        pendings: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        group: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    },
    {timestamps: true}
);
EntitySchema.plugin(uniqueValidator, {message: "Is already taken"});

EntitySchema.statics.create = function (dataEntity) {
    const new_entity = new this(dataEntity);
    return new_entity.save();
};

EntitySchema.statics.list = function (perPage, page, type = null) {

   const localUrl = "mongodb://localhost:27017/shareallDb";
};

EntitySchema.statics.removeById = function (id) {
    return new Promise((resolve, reject) => {
        this.remove({_id: id}, err => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

EntitySchema.statics.patch = function (id, entityData) {
    // needs to Ensure no collision

    return new Promise((resolve, reject) => {
        this.findById(id, function (err, entity) {
            if (err) reject(err);
            for (let i in entityData) {
                entity[i] = entityData[i];
            }
            entity.save(function (err, updatedEntity) {
                if (err) return reject(err);
                resolve(updatedEntity);
            });
        });
    });
};



module.exports = mongoose.model("Product", EntitySchema);
