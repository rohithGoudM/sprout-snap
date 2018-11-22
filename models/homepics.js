const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homepicSchema = new Schema({
	picName: String,
	picUrl: String,
	picAdmin: String,
	picAnsName: String,
	picAnsUrl: String,
	picStatus: String,
	picTeamName: String
});

const Homepic = mongoose.model('homepic', homepicSchema);

module.exports = Homepic;