const mongoose = require('mongoose')

const prodModuleSchema = mongoose.Schema(
    {
        productId : {
            type : String,
            require : true,
            unique : true
        },
        modules : {
            type : [
                {
                    path : [
                        {
                            pathName : {
                                type : String,
                                required : true,
                            },
                            section : [
                                {
                                    sectionName : {
                                        type : String
                                    }
                                }
                            ]
                        }  
                    ]
                }
            ]
        }
    }
)

module.exports = mongoose.model("ProductModel", prodModuleSchema) 