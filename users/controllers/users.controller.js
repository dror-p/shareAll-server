const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
var User = mongoose.model("User");
var Product = mongoose.model("Product");
exports.insert = (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = {
        //name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        provider: req.body.provider
      };
      if(newUser.password){
      // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            // Calling the model to create the user
            User.create(newUser)
              .then(user => {
                let userobject = user.toObject();

                delete userobject.password;
                res.json(userobject);
              })
              .catch(function(error) {
                throw err;
              });
          });
        });
      }else{
        User.create(newUser)
        .then(user => {
          let userobject = user.toObject();
          res.json(userobject);
        })
        .catch(function(error) {
          throw err;
        });
      }
    }
  })
};

exports.update = (req, res) =>  {
  User.findOneAndUpdate({email: req.body.user.email}, req.body.user, {
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

exports.loginOAuth = (
  email,
  name,
  familyName,
  provider,
  id_provider,
  picture = "",
  cb_success,
  cb_fail
) => {
  /* Adds a passwordless acount for 0Auth users if account doesnt exist, or log in if it does.
  - provider in ["Google"]
  - id-provider = identifier for this provider
  - cb_match_success = callback if user found/created function(user)
  - cb_success = callback function(user)
  - cb_fail = callback function(err)
  */
  // We lookup if already exist
  User.findOne(
    { OAuthId: id_provider, OAuthProvider: provider, email: email },
    (err, userMatch) => {
      // handle errors here:
      if (err) {
        return cb_fail(err);
      }
      // if there is already someone with that googleId
      if (userMatch) {
        cb_success(userMatch);
      } else {
        // creating the new user
        const newUser0Auth = {
          OAuthProvider: provider,
          OAuthId: id_provider,
          name: name,
          familyname: familyName,
          profilePicture: picture,
          email: email,
          permissionLevel: 0
        };
        User.create(newUser0Auth)
          .then(user => {
            cb_success(user);
          })
          .catch(function(error) {
            cb_fail(error);
          });
      }
    }
  ); // closes User.findONe
};

exports.list = (req, res) => {
  let limit =
    req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  User.list(limit, page).then(result => {
    res.status(200).send(result);
  });
};

exports.getById = (req, res) => {
  User.findById(req.params.userId)
    .then(result => {
      return res.status(200).send(result);
    })
    .catch(err => {
      return res
        .status(400)
        .send({ error: "Error. Probably Wrong id.", err: err });
    });
};

exports.patchById = (req, res) => {
  // We make sure to not patch the permissionLevel and id
  delete req.body["permissionLevel"];
  delete req.body["id"];
  // We make sure they try to modify themselves if they don't have the right permission

  var newUser = req.body;
  if (req.body.password) {
    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;

        User.patch(req.params.userId, newUser).then(result => {
          res.status(200).send({});
        });
      });
    });
  } else {
    User.patch(req.params.userId, req.body).then(result => {
      res.status(200).send({});
    });
  }
};
exports.removeById = (req, res) => {
  User.removeById(req.params.userId).then(result => {
    res.status(200).send({});
  });
};
/* exports.getByEmail = (req, res) => {
  User.find({email: req.params.email})
      .then(result => {
          return res.status(200).send(result[0]);
      })
      .catch(err => {
          return res
              .status(400)
              .send({error: "Error. Probably Wrong id.", err: err});
      });
}; */


exports.getUserProductHistory = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findOne({_id: userId}).populate('searchHistory');
  if (!user.searchHistory) {
      user.searchHistory = [];
  }

  res.status(200).send(user.searchHistory);
};
exports.addProductToHistory = async (req, res) => {
  const userId = req.params.id;
  const productId = req.params.product;
  const product = await Product.findOne({_id: productId});
  const user = await User.findOne({_id: userId});
  if (!user.searchHistory) {
      user.searchHistory = [];
  }
  if (user.searchHistory.indexOf(productId) == -1) {
      user.searchHistory.push(productId);
      if (!product.watches) {
          product.watches = 1;
      } else {
          product.watches++;
      }
      await product.save();
  } else {
      console.log('productId already exist in history');
  }

  user.save().then(function () {
      res.status(200).send({data: user});
  }).catch(e => {
      return res.status(400).send({
          error: "Error saving user. Information might be incomplete."
      });
  });
};

exports.getByEmail = (req, res) => {
  User.findOne({"email": req.params.email})
    .then(result => {
      return res.status(200).send(result);
    })
    .catch(err => {
      return res
        .status(400)
        .send({ error: "Error. Probably Wrong id.", err: err });
    });
};

exports.updateByEmail = (req, res) => {

  const filter = {"email":  req.params.email};
  const update = {"renterRate": req.params.newRate};

  User.findOneAndUpdate(filter, update).then(result => {
    res.status(200).sendStatus({});
  });
};
