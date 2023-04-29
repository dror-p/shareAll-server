const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const rp = require('request-promise');
const $ = require('cheerio');
const ProductRent = mongoose.model("ProductRent");
var User = mongoose.model("User");
const { next } = require("cheerio/lib/api/traversing");
const { replaceWith } = require("cheerio/lib/api/manipulation");

exports.insert = (req, res, next) => {
    var product = new Product(req.body.product);
    return product.save().then(function () {
        res.status(200).send({data: product});
    }).catch(e => {
        return res.status(400).send({
            error: "Error saving post. Information might be incomplete."
        });
    });

};

exports.getById = (req, res) => {
    Product.findById(req.params.id)
        .then(result => {
            res.status(200).send({data: result});
        })
        .catch(e => {
            return res.status(400).send({error: "Error. Probably Wrong id."});
        });
};

exports.patchById = (req, res) => {
    // We make sure they try to modify themselves if they don't have the right permission

    var patchedProduct = req.body.data;
    // We make sure to not patch the author and id
    delete patchedProduct["author"];
    delete patchedProduct["id"];

    Product.patch(req.params.id, patchedProduct)
        .then(result => {
            res.status(200).send({data: result});
        })
        .catch(e => {
            return res.status(400).send({error: "Error modifying the entity."});
        });
};

exports.list = (req, res) => {
    var query = {};
    if (req.query.type && (req.query.type === 'rent' || req.query.type === 'buyGlobal')) {
        query.productType = req.query.type;
    }

    Product.find(query)
        .exec(function (err, entities) {
            if (err) {
                console.log(err)
                res.status(400).send({error: "Probably invalid data"});
            } else {
                res.json(entities).status(200);
            }
        });
};

exports.test = (req, res) => {
    let productName = 'iphone';

    if(req.query.product) {
        productName = req.query.product;
    }

    const url = 'https://www.zap.co.il/search.aspx?keyword=' + encodeURI(productName);

    rp(url)
      .then(function(html){
        //success!
        var a = $.default('.Prices > .pricesRow > .pricesTxt', html).text().replace(/,/g, '').replace(/[^\d]/g, ' ').split(' ');
        var filtered = a.filter(function (el) {
            return el != null && el != '';
          });

        var sum = 0;

        filtered.map(x => {
            sum += +x;
        });

        var avrage = sum / filtered.length;
        res.status(200).send({avrage: avrage});
      })
      .catch(function(err){
          console.log(err)
      });
};

exports.groupRequest = async (req, res, next) => {
    const productId = req.params.id;
    const userId = req.params.userId;

    const product = await Product.findOne({_id: productId});
    if (!product.pendings) {
        product.pendings = [userId];
    } else {
        product.pendings.push(userId);
    }

    return product.save().then(function () {
        res.status(200).send({data: product});
    }).catch(e => {
        return res.status(400).send({
            error: "Error saving productRent. Information might be incomplete."
        });
    });

};
exports.rentRequest = (req, res, next) => {
    const productId = req.params.id;
    const userId = req.body.userId;
    const from = req.body.from;
    const to = req.body.to;
    var productRent = new ProductRent({user: userId, product: productId, from, to, status: "pending"});
    return productRent.save().then(function () {
        res.status(200).send({data: productRent});
    }).catch(e => {
        return res.status(400).send({
            error: "Error saving productRent. Information might be incomplete."
        });
    });
};

exports.rentApprove = (req, res, next) => {
    const Idproductrents = req.params.productid;
    ProductRent.findOneAndUpdate({_id: Idproductrents}, {status:"approve"}, {
        upsert: true // Make this update into an upsert
      }).then(result => {
        return res.status(200).send(result);
      })
      .catch(err => {
        return res
          .status(400)
          .send({ error: "Error. Probably Wrong id.", err: err });
      });
};

exports.getRentReqs = (req, res, next) => {
    const userid = req.params.userid;
    ProductRent.find({user: userid , status:"pending"}).then(result => {
        return res.status(200).send(result);
    })
    .catch(err => {
        return res
            .status(400)
            .send({error: "Error. Probably Wrong id.", err: err});
    });
};


exports.getByemail = (req, res, next) => {
    Product.find({users: [req.params.user]})
    .then(result => {
        return res.status(200).send(result[0]);
    })
    .catch(err => {
        return res
            .status(400)
            .send({error: "Error. Probably Wrong id.", err: err});
    });
};
    
exports.RequestApproval = async (req,res, next) => {
    let user = await User.findOneById(req.params.userId);
    let product = await Product.findById(req.params.productid);

     product.pendings.pull(req.params.userId);
     product.users.push(user.email);
    Product.findOneAndUpdate({_id : req.params.productid}, product, {
        upsert: true // Make this update into an upsert
      }).then(result => {
        return res.status(200).send(result);
      })
      .catch(err => {
        return res
          .status(400)
          .send({ error: "Error. Probably Wrong id.", err: err });
      });
}