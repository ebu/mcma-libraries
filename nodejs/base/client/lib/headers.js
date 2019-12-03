const McmaHeaders = { prefix: "mcma-" };
McmaHeaders.tracker = McmaHeaders.prefix + "tracker";

module.exports = {
    McmaHeaders: Object.freeze(McmaHeaders)
};