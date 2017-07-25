const dynamoose = require('dynamoose');
const bcrypt = require('bcryptjs');


dynamoose.AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-west-2'
});

const options = {
    create: true, // Create table in DB, if it does not exist,
    update: false, // Update remote indexes if they do not match local index structure
    waitForActive: true, // Wait for table to be created before trying to use it
    waitForActiveTimeout: 180000, // wait 3 minutes for table to activate
}

dynamoose.setDefaults(options);

var Schema = dynamoose.Schema;

var BatteryDataSchema = new Schema(
    {
        batteryId: {
            type: Number,
            required: true,
            trim: true,
            validate: function(v) {
                return v > 0;
            },
            hashKey: true
        },
        timestp: {
            type: Number,
            trim: true,
            //index: true // name: nameLocalIndex, ProjectionType: ALL
            required: true
        },
        SoC: {
            type: String,
            trim: true,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: 'creationDate',
            updatedAt: 'lastUpdateDate'
        }
    }
);

var BatterData = dynamoose.model('t_soc_test', BatteryDataSchema);



var awsddb = dynamoose.ddb()
//var ddb = dynamoose.local();



module.exports.queryBatteryData = function(from, to) {
    var query = {timestp: {ge: from , lt: to} }
    BatterData.scan('timestp').between(from, to).exec(function (err, count) {
        // Only one count left
        //c = count[0];
        console.log(count)
        // Count.update(c, {$PUT : {count : c.count + 1}} , function (err) {
        //     if(err) { return console.log(err) }
        //     newUser.id = c.count + 1;
        //     register(newUser)
        // });
    });
}

module.exports.queryBatteryData(1495230439000,1495230463000)
module.exports.queryBatteryData(0,200)
