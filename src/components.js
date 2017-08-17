/*--- components.js ---*/

Crafty.c('Grid', {
	init: function() {
		this.attr({
			w: Game.map_grid.cell.width,
			h: Game.map_grid.cell.height
		});
	},

	at: function(x, y) {
		if(x === undefined && y === undefined) {
			return {x: this.x/Game.map_grid.cell.width, y: (this.y - this.h + 1)/Game.map_grid.height};
		} else {
			this.attr({x: x * Game.map_grid.cell.width, y: (y + 1) * Game.map_grid.cell.height - this.h});
			return this;
		}
	},

	size: function(w, h) {
		if(w === undefined && h === undefined) {
			return {w: this.w/Game.map_grid.cell.width, h: this.h/Game.map_grid.height};
		} else {
			this.attr({w: w * Game.map_grid.cell.width, h: h * Game.map_grid.cell.height});
			return this;
		}
	},

});

Crafty.c('Actor', {
	init: function() {
		this.requires("2D, Canvas, Grid");
	},
});

Crafty.c('BK', {
	init: function() {
		this.requires('Actor, Color, Mouse')
			.size(Game.map_grid.width, Game.map_grid.height)
			.at(0, Game.map_grid.height-1)
			.color('blue')
			.bind('MouseMove', this.onMouseOver);
	},
	
	onMouseOver: function(e) {
		console.log('over',e.realX,e.realY);
		selector.x = e.realX;
		selector.y = e.realY;
	},
});

Crafty.c('Item', {
	init: function() {
		this.requires("Actor");
	},
	
	style: function(style) {
		this.requires(style);
		return this;
	},
});

/********************* Shop *********************/
Crafty.c('Product', {
	init: function() {
		this.requires('Item, Mouse')
			.bind("MouseOver", this.onMouseOver)
			.bind("MouseOut", this.onMouseOut)
			.bind('Click', this.onClick);
	},
	
	setPro: function(comp, style, size, id, price, _selector) {
		this.comp = comp;
		this.style = style;
		this.size = size;
		this.id = id;
		this.price = price;
		this.selector = _selector;
		return this;
	},
	
	onMouseOver: function(mouse) {
		this.alpha = 0.8;
		// 出現價格在下方
		this.pricebox = Crafty.e('2D, DOM, Text')
			.text(this.price+' 鴨幣')
			.attr({x:this.x, y:this.y+this.h+10, w:100})
			.textFont({size: '15px'});
	},
	
	onMouseOut: function(mouse) {
		this.alpha = 1;
		this.pricebox.destroy();
	},
	
	onClick: function() {
		if(this.selector.selected_item) {
			this.selector.selected_item.box.destroy();
		}
		// TODO: 新增物品解說
		this.box = Crafty.e('Product_box')
			.setPro(this.id);
		this.selector.selected_item = this;
	},
});


Crafty.c('Buyer', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_buy")
			.bind('Click', this.buy)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	setPro: function(id) {
		this.id = id;
		return this;
	},
	
	buy: function() {
		var _money = money - Game.thing[this.id].price;
		if(_money < 0) {
			document.getElementById('msg').innerHTML = "【系統】 錢不夠, 要課嗎? <br/> \
				" + document.getElementById('msg').innerHTML;
			return;
		}
		for(key in Game.bag){
			if (Game.bag[key] == null){
				Game.bag[key] = Game.thing[this.id];
				money -= Game.thing[this.id].price;
				// TODO: 上傳money, 上傳bag
				break;
			}
		}

		document.getElementById('msg').innerHTML = "【系統】 已購買<br/> \
			" + document.getElementById('msg').innerHTML;
		Crafty.scene('Shop');
	},

});

Crafty.c('Product_box', {
	init: function() {
		this.requires('Item')
			.bind('Remove', this.remove);
	},
	
	setPro: function(id) {
		this.product = Crafty.e('Item').style(Game.thing[id].style)
			.size(Game.thing[id].size.w, Game.thing[id].size.h)
			.at(2, 15);
			
		this.buy = Crafty.e('Buyer').setPro(id).at(10, 15);
		return this;
	},
	
	remove: function() {
		this.buy.destroy();
		this.product.destroy();
	},
});

Crafty.c('Shop_bag', {
	init: function() {
		this.requires('Item, Mouse')
			.bind("MouseOver", this.onMouseOver)
			.bind("MouseOut", this.onMouseOut)
			.bind('Click', this.onClick);
	},
	
	setPro: function(comp, style, size, id, price, _selector, bag_i) {
		this.comp = comp;
		this.style = style;
		this.size = size;
		this.id = id;
		this.price = price;
		this.selector = _selector;
		this.bag_i = bag_i;
		return this;
	},
	
	onMouseOver: function(mouse) {
		this.alpha = 0.8;
		// 出現價格在下方
		this.pricebox = Crafty.e('2D, DOM, Text')
			.text(Math.round(this.price*Game.data.sell_percent)+' 鴨幣')
			.attr({x:this.x, y:this.y+this.h+10, w:100})
			.textFont({size: '15px'});
	},
	
	onMouseOut: function(mouse) {
		this.alpha = 1;
		this.pricebox.destroy();
	},
	
	onClick: function() {
		if(this.selector.selected_item) {
			this.selector.selected_item.box.destroy();
		}
		// TODO: 新增物品解說
		this.box = Crafty.e('BagItem_box')
			.setPro(this.id, this.bag_i);
		this.selector.selected_item = this;
	},
});

Crafty.c('Seller', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_sell")
			.bind('Click', this.sell)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	setPro: function(id, bag_i) {
		this.id = id;
		this.bag_i = bag_i;
		return this;
	},
	
	sell: function() {
		var _money = money + Game.thing[this.id].price;
		Game.bag[this.bag_i] = null;
		money += Math.round(Game.thing[this.id].price*Game.data.sell_percent);
		// TODO: 上傳money, 上傳bag
	
		Crafty.scene('Edit');
		document.getElementById('msg').innerHTML = "【系統】 已賣出<br/> \
			" + document.getElementById('msg').innerHTML;
		Crafty.scene('Shop');
	},

});

Crafty.c('BagItem_box', {
	init: function() {
		this.requires('Item')
			.bind('Remove', this.remove);
	},
	
	setPro: function(id, bag_i) {
		
		this.product = Crafty.e('Item').style(Game.thing[id].style)
			.size(Game.thing[id].size.w, Game.thing[id].size.h)
			.at(2, 15);
		this.sell = Crafty.e('Seller').setPro(id, bag_i).at(10, 15);
		return this;
	},
	
	remove: function() {
		this.sell.destroy();
		this.product.destroy();
	},
});

Crafty.c('Shop_Saver', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_save")
			.at(Game.map_grid.width - 4,2)
			.bind('Click', this.save)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	save: function() {
		if (!userLogin) return;
		document.getElementById('msg').innerHTML = "【系統】 已儲存<br/>" + document.getElementById('msg').innerHTML;
		var dat = {};
		// upload bag data
		for(index in Game.bag){
			if (Game.bag[index] == null)
				dat[index] = null;
			else {
				dat[index] = Game.bag[index].i;
			}
		}
		firebase.database().ref('bags/' + userLogin.uid)
			.set(dat)
			.catch(function(error){
				console.error("寫入使用者資訊錯誤",error);
			});
		// upload money data
		firebase.database().ref('person/' + userLogin.uid+"/money")
			.set(money)
			.catch(function(error){
				console.error("寫入使用者資訊錯誤",error);
			});
		Crafty.scene('Game');
	}
});
/********************* Shop End *********************/
/********************* CheckIn *********************/

Crafty.c('CheckIn_Block', {
	init: function() {
		this.requires('Actor, Color')
			.size(5,15)
			.at(10,15);
		
		
		this.html = Crafty.e('2D, DOM, HTML, Mouse')
			.append('\
				<h2 class="date">8月13號</h2> \
				<h3 class="prize">200鴨幣</h3> \
			').css({
				'border': 'solid 1px ',
				'padding': '5px',
				'cursor': 'pointer', 
			}).bind('MouseOver',function(mouse){
				this.attr({
					w: this.w + 2,
					h: this.h + 2,
				});
			}).bind('MouseOut',function(mouse){
				this.attr({
					w: this.w - 2,
					h: this.h - 2,
				});
			}).bind('Click',function(mouse){
				// 判斷是否達成簽到標準
			});
	},
	
	_update: function() {
		this.html
			.attr({x: this.x + 50 , y: this.y + 20, w: this.w, h: 100});
	}

});

Crafty.c('Home', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_save")
			.at(Game.map_grid.width - 4,2)
			.bind('Click', this.home)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	home: function() {
		Crafty.scene('Game');
	}
});

/********************* CheckIn End *********************/
var selected_item;
var put_item;
Crafty.c('Inbag', {
	init: function() {
		this.requires("Item, Mouse, Color")
			.bind("Click", this.onClick)
			.bind("MouseOver", this.onMouseOver)
			.bind("MouseOut", this.onMouseOut);
		this.alpha = 1;
	},

	offClick: function() {
		this.bind("MouseOut", this.onMouseOut);
		this.trigger("MouseOut");
		//this.onMouseOut();
		return this;
	},	
	
	setPro: function(comp, style, size, index, tmp) {
		this.index = index;
		this.comp = comp;
		this.style = style;
		this.size = size;
		this.tmp = tmp;
		return this;
	},
	
	onClick: function(mouse) {
		if(selected_item != undefined)
			selected_item.offClick();
		if(put_item)
			put_item.destroy();
		selected_item = this;
		this.onPut();
		//selector.onPut();
	},
	
	onMouseOver: function(mouse) {
		this.alpha = 0.8;
	},
	
	onMouseOut: function(mouse) {
		this.alpha = 1;
	},
	
	myRemove: function() {
		Game.bag[this.index] = null;
		console.log('myRemove', this.index);
	},
	
	onPut: function() {
		put_item = Crafty.e(this.comp)
			.style(this.style)
			.size(this.size.w,this.size.h)
			.at(house.x+1, floor_top-1)
			.onMove();
	},
	
});


/********************* TABLE *********************/
Crafty.c('Table', {
	init: function() {
		this.requires("Item, Twoway")
			.twoway(300)
			.disableControl()
			.bind('Moved', this.moving);
	},
	
	setPro: function(tmp) {
		this.tmp = tmp;
		return this;
	},
	
	moving: function() {
		if(this.x < (house.x+1)*Game.map_grid.cell.width)
			this.x = (house.x+1)*Game.map_grid.cell.width;
		else if(this.x > (house.x+house.w)*Game.map_grid.cell.width - this.w)
			this.x = (house.x+house.w)*Game.map_grid.cell.width-this.w;
	},
	
	onMove: function() {			
		this.enableControl();
		this.bind('KeyDown', function(e){
			if(e.key == Crafty.keys.ENTER ){
				var i = Math.round(this.x/Game.map_grid.cell.width) - house.x - 1;
				if(Game.item[i] != null) {
					document.getElementById('msg').innerHTML = "【系統】 不能放在這裡<br/> \
						" + document.getElementById('msg').innerHTML;
					return;
				}
				Game.item[i] = selected_item.tmp;
				
				this.offMove();
				put_item = undefined;
				player_data = {x: player.x/Game.map_grid.cell.width, y:player.y/Game.map_grid.cell.width +1};
				selected_item.myRemove();
				selected_item.destroy();
				Crafty.scene('Edit');
			}else if(e.key == Crafty.keys.ESC) {
				this.destroy();
				selector.onMove();
			}
		});
		return this;
	},
	
	offMove: function() {
		this.disableControl();
		this.unbind('KeyDown');
		this.x = Math.round(this.x/Game.map_grid.cell.width)*Game.map_grid.cell.width;
	},
});

Crafty.c('Saver', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_save")
			.at(Game.map_grid.width - 4,2)
			.bind('Click', this.save)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	save: function() {
		if (!userLogin) return;
		document.getElementById('msg').innerHTML = "【系統】 已儲存<br/>" + document.getElementById('msg').innerHTML;
		var dat = {};
		// upload bag data
		for(index in Game.bag){
			if (Game.bag[index] == null)
				dat[index] = null;
			else {
				dat[index] = Game.bag[index].i;
			}
		}
		firebase.database().ref('bags/' + userLogin.uid)
			.set(dat)
			.catch(function(error){
				console.error("寫入使用者資訊錯誤",error);
			});
		// upload item data
		for(index in Game.item){
			if (Game.item[index] == null)
				dat[index] = null;
			else {
				dat[index] = Game.item[index].i;
			}
		}
		firebase.database().ref('items/' + userLogin.uid)
			.set(dat)
			.catch(function(error){
				console.error("寫入使用者資訊錯誤",error);
			});
		Crafty.scene('Game');
	}
});

Crafty.c('Editor', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_edit")
			.at(Game.map_grid.width - 4,2)
			.bind('Click', this.edit)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	edit: function() {
		document.getElementById('msg').innerHTML = "【系統】 進入建造模式<br/> \
			【說明】Enter : 確定 <br/> \
			【說明】Esc : 退出<br/> \
			【說明】左右方向鍵 : 移動<br/> \
			【說明】滑鼠點選背包物品可放置家具<br/> \
			【說明】滑鼠雙擊家具可收回包包<br/>" + document.getElementById('msg').innerHTML;
		Crafty.scene('Edit');
		return;
	}
});

Crafty.c('CheckIner', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_edit")
			.at(Game.map_grid.width - 10,2)
			.bind('Click', this.checkin)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	checkin: function() {
		document.getElementById('msg').innerHTML = "【系統】 進入簽到區<br/> \
			" + document.getElementById('msg').innerHTML;
		Crafty.scene('CheckIn');
		return;
	}
});

Crafty.c('Shoper', {
	init: function() {
		this.requires('Item, Mouse')
			.style("spr_shop")
			.at(Game.map_grid.width - 7,2)
			.bind('Click', this.edit)
			.bind('MouseOver', function() {
				this.size(1.8,1.8);
			}).bind('MouseOut',function() {
				this.size(2,2);
			});
	},
	
	edit: function() {
		Crafty.scene('Shop');
		return;
	}
});

Crafty.c('Wall', {
	init: function() {
		this.requires("Item, Solid");
	},
});

Crafty.c('BackGround', {
	init: function() {
		this.requires("Item");
	},
});

Crafty.c('Floor', {
	init: function() {
		this.requires("Item");
	},
});

Crafty.c('Door', {
	init: function() {
		this.requires("Item, Collision, spr_door, SpriteAnimation")
			.checkHits("Player")
			.reel('open',500 , 1, 0, 1)
			.reel('close',500 ,[[1,0],[0, 0]])
			.bind("HitOn", this.openDoor)
			.bind("HitOff", this.closeDoor);
	},
	openDoor: function(hitData) {
		this.animate('open', 1);
		
	},
	closeDoor: function() {
		this.animate('close',1);
	},
});

/********************* PLAYER *********************/

Crafty.c('Player', {
	init: function() {
		this.requires("Actor, Twoway, Collision, spr_dock, SpriteAnimation, Gravity, Mouse, Move")
			.attr({z: 1})
			.twoway(Game.map_grid.cell.width/0.2)
			.stopOnSolids()
			.gravity("Floor")
			.reel('PlayerMovingRight',400 , 0, 2, 3)
			.reel('PlayerMovingLeft',400 , 0, 1, 3)
			.bind('Click', this.touchCB);
			
		this.bind('NewDirection', function(data) {
			if (data.x > 0) {
				this.animate('PlayerMovingRight', -1);
			} else if (data.x < 0) {
				this.animate('PlayerMovingLeft', -1);
			}
		});
		this.bind('Moved', function(data) {
			player_data.x = this.x/Game.map_grid.cell.width;
		});
	},
	
	onBindSelector: function() {
		return this;
	},
	
	offBindSelector: function() {
		this.unbind('KeyDown');
		return this;
	},
	

	stopOnSolids: function() {
		this.onHit('Solid', this.stopMovement);
		return this;
	},

	  // Stops the movement
	stopMovement: function() {
		this.x -= this._motionDelta.x;
	},
});

