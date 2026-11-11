const mongoose = require("mongoose");
const {Schema} = mongoose;

const taskSchema = new Schema({
    title: {
        type : String,
        require : true
    },
    discription: {
        type : String
    },
    image : {
        type: String,
        default: null
    },
    creator : {
        type :String
    },
    status: {
      type : String,
      enum : ["todo", "pending", "complete"],
      default : "todo"
    },



}, {
    timestamps: true
}, );

module.exports = mongoose.model('task', taskSchema);