var rainbow = require('rainbow-load');

rainbow.config({
  autoRun: true,
  barThickness: 5,
  barColors: {
    '0': 'rgba(160, 193, 58, 1)',
    '1': 'rgba(42, 203, 177, 1)'
  },
  shadowBlur   : 5,
  shadowColor  : 'rgba(0, 0, 0, .5)'
});

module.exports = rainbow;
