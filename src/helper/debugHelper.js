function l() {
    console.log(...arguments);
}
function lw() {
    console.warn('Warning: ', ...arguments);
}
function le() {
    console.error('Error: ', ...arguments);
}

exports = module.exports = {
    l,
    lw,
    le,
}