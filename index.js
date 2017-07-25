'use strict';

console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

const dynamoose = require('dynamoose');
const bcrypt = require('bcryptjs');


const options = {
    create: false, // Create table in DB, if it does not exist,
    update: false, // Update remote indexes if they do not match local index structure
    waitForActive: true, // Wait for table to be created before trying to use it
    waitForActiveTimeout: 180000, // wait 3 minutes for table to activate
}

dynamoose.setDefaults(options);

var Schema = dynamoose.Schema;

var SocSchema = new Schema(
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
            type: Number,
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

var Soc = dynamoose.model('t_soc_test', SocSchema);



var TempSchema = new Schema(
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
        temp: {
            type: Number,
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

var Temp = dynamoose.model('t_temp_test', TempSchema);


var CurrentSchema = new Schema(
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
        ch_cur: {
            type: Number,
            trim: true,
            required: true
        },
        dis_cur: {
            type: Number,
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

var Current = dynamoose.model('t_current_test', CurrentSchema);




var awsddb = dynamoose.ddb()




/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : 'http://localhost:4200',
            'Access-Control-Allow-Methods' : 'GET',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            // dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            var type = event.queryStringParameters.type
            switch (type) {
                case 'soc' :
                    var from = event.queryStringParameters.from
                    var to = event.queryStringParameters.to
                    Soc.scan('timestp').between(from, to).exec(done);
                    break; 
                
                case 'temp' :
                    var from = event.queryStringParameters.from
                    var to = event.queryStringParameters.to
                    Temp.scan('timestp').between(from, to).exec(done);
                    break;

                case 'current' :
                    var from = event.queryStringParameters.from
                    var to = event.queryStringParameters.to
                    Current.scan('timestp').between(from, to).exec(done);
                    break;
            }
            break;
        case 'POST':
            dynamo.putItem(JSON.parse(event.body), done);
            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
