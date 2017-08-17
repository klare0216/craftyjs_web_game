/*---- Game.js ----*/


// defined grid size
Game = {
	
	map_grid: {
		width: 35,
		height: 17,
		cell: {
			width: 24,
			height: 24,
		},	
	},
	
	thing: [{i:0,cmp:'Table', style:'spr_f', size:{w: 2,h: 3}, price: 40}, 
		{i:1,cmp:'Table', style:'spr_kb', size:{w: 2,h: 1}, price: 40}, 
		{i:2,cmp:'Table', style:'spr_flag', size:{w: 1,h: 2}, price: 55},
		{i:3,cmp:'Table', style:'spr_fan', size:{w: 1,h: 2}, price: 50},
		{i:4,cmp:'Table', style:'spr_pot', size:{w: 1,h: 2}, price: 140},
		{i:5,cmp:'Table', style:'spr_shelf', size:{w: 1,h: 2}, price: 60},
		{i:6,cmp:'Table', style:'spr_sofa', size:{w: 1,h: 2}, price: 33},
	],
	
	data: {
		sell_percent: 0.3,
	},
		
		
	bag: [null, null, null, null, null,
		null, null, null, null, null],
	
	item: [null, null, null, null, null,
		null, null, null, null, null],
		
	item2: [null, null, null, null, null,
		null, null, null, null, null],
		

	width: function() {
		return this.map_grid.width * this.map_grid.cell.width;
	},

	height: function() {
		return this.map_grid.height * this.map_grid.cell.height;
	},

	start: function() {
		Crafty.init(Game.width(), Game.height(), document.getElementById('game'));
		Crafty.scene('Loading');
	},
	
	
	
};
var money = 0;
var userLogin;
var text_css = {'size': '24px', 'color': 'blue', 'text-align': 'center'};


