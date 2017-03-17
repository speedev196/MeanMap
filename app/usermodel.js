// Pulls Mongoose dependency for creating schemas
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    hash: { type: String, default: '' },
    created_date: { type: Date, default: Date.now }

});



// Sets the created_at parameter equal to the current time
UsersSchema.pre('save', function(next) {
    now = new Date();
    if (!this.created_date) {
        this.created_date = now
    }
    next();
});


// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('users', UsersSchema);