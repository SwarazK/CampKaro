// A wrapper function into which async functions are passed and it runs them and catches any errors and passes them onto next
module.exports = func => {
    return(req,res,next) => {
        func(req, res, next).catch(next);
    }
}