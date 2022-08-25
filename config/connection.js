const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}

module.exports.connect=function(done){
    const URL = 'mongodb://localhost:27017'
    const DB_NAME = 'shopping'
    mongoClient.connect(URL,(err,data)=>{
        if (err) return done(err)
        state.db = data.db(DB_NAME)
        done()
    })
    

}

module.exports.get = function (){
    return state.db
} 