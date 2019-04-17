const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    inventory: {
        type: Number,
        default: 0,

    },
    price: {
        type: Number,
        require: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

productSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id;

        delete ret.deleted;
        delete ret._id;
        delete ret.__v;
    }
})

const Product = mongoose.model('Products', productSchema);

module.exports = Product;

