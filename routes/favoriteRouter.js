const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const Users = require('../models/user');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null) {
                    // console.log('Favorite found ', favorite._id);
                    // console.log('user found ', req.user._id);
                    // console.log('this is req.body: ', req.body);
                    req.body.forEach(value => {
                        // console.log('This is req.body value: ', value);
                        // console.log('Object.values(value).toString(): ', Object.values(value).toString(), typeof Object.values(value).toString());
                        // console.log('favorite.dishes.keys(): ', favorite.dishes);
                        // console.log('Does it have duplicate? ', favorite.dishes.indexOf(Object.values(value).toString()) === -1);
                        if (favorite.dishes.indexOf(Object.values(value).toString()) === -1)
                            favorite.dishes.push(value);
                    })
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('_id')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err));
                }
                else {
                    Favorites.create({ user: req.user._id, dishes: req.body })
                        .then((favorite) => {
                            Favorites.findOne(favorite._id)
                                .populate('_id')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        })
                }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                favorite.remove
            })
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    // .get(cors.cors, (req, res, next) => {
    //     Favorites.findById(req.params.favoriteId)
    //         .populate('comments.author')
    //         .then((favorite) => {
    //             console.log('favorite Created ', favorite);
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json(favorite);
    //         }, (err) => next(err))
    //         .catch((err) => next(err));
    // })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // how do i find favoritesID related to the userid?
        //the following is specific favorite id
        // console.log('To find userID: ', Favorites.findOne({ user: req.user._id }));
        // Favorites.findById('63bf8e36087a8e59506fe987')
        Favorites.findOne({ user: req.user._id })
            // Favorites.findByUsername(req.user.username)
            .then((favorite) => {
                console.log('Favorite found ', favorite._id);
                console.log('user found ', req.user._id);
                console.log('dish found ', req.params.dishId);
                //a) create a favorite document if such a document 
                //corresponding to this user does not already exist in the system
                //b) add the dishes specified in the body of the message to the list 
                //of favorite dishes for the user, if the dishes do not already exists in the list of favorites.
                if (favorite != null) {
                    // console.log('current favorite - ', favorite.dishes);
                    // console.log('Deos it come here?', typeof req.params.dishId);
                    if (favorite.dishes.indexOf(req.params.dishId) === -1)
                        favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findOne(favorite._id)
                                .populate('_id')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err));
                } else {
                    Favorites.create(req.body)
                        .then((favorite) => {
                            favorite.user = req.user._id;
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findByIdAndUpdate(req.params.favoriteId, {
            $set: req.body
        }, { new: true })
            .then((favorite) => {
                console.log('favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        //remove only the user's favorite
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null) {
                    favorite.dishes.remove(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findOne(favorite._id)
                                .populate('_id')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }, (err) => next(err));
                }
            })
    });

module.exports = favoriteRouter;