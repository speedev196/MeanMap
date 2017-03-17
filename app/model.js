// Pulls Mongoose dependency for creating schemas
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlacesSchema = new Schema({
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    loc: { type: [Number], required: true },
    description: { type: String, default: '' },
    likes: Number,
    tags: [String],
    images: [String],
    thumbnail: String,
    posted_date: { type: Date, default: Date.now },
    posted_user: { type: String, default: '' }
});



// Sets the created_at parameter equal to the current time
PlacesSchema.pre('save', function(next) {
    now = new Date();
    if (!this.posted_date) {
        this.posted_date = now
    }
    next();
});

// Indexes this schema in geoJSON format (critical for running proximity searches)
PlacesSchema.index({ loc: '2dsphere' });

// Exports the UserSchema for use elsewhere. Sets the MongoDB collection to be used as: "scotch-user"
module.exports = mongoose.model('places', PlacesSchema);