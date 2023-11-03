exports.index = (req,res)=>{
    res.render('./index');
};

exports.about= (req, res) => {
    res.render("about");
  };

exports.contact = (req, res) => {
    res.render("contact");
  };

exports.trades = (req,res)=>{
    res.render(tradeRoutes)
};
exports.user = (req,res) => {
  res.render()
}