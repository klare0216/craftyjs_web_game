/*--- Scene.js ---*/

Crafty.scene('Loading', function() {
	
	Crafty.e('2D, DOM, Text')
		.text('讀取中, 請燒齁')
		.attr({x: 0, y: Game.height()/2-30, w:Game.width()})
		.textColor('white')
		.textAlign('center')
		.textFont({'size': '30px', 'font-weight':'light'});
	
	// set controler
	Crafty.multitouch(true);
		
	// load sprite map image
	Crafty.load({
			'images': ['../img/dock.png',
				'../img/wall.png',
				'../img/w.png',
				'../img/door.png',
				'../img/f.png',
				'../img/save.png',
				'../img/bag.png',
				'../img/john.png'],
		}, function() {
			Crafty.sprite(48 , '../img/dock.png', {
				spr_dock: [0,0],
				spr_dockback: [0,3],
			});
			Crafty.sprite(64, '../img/wall.png', {
				spr_wood: [1,1],
				//spr_door: [0,3]
			});
			Crafty.sprite(48, '../img/w.png', {
				spr_wall: [0,0],
				spr_wall_top: [1,0],
				spr_wall2: [0,2],
				spr_wall2_top: [1,2],
				spr_floor: [0,1],
				spr_floor_top: [1,1],
				spr_floor2: [2,1],
				spr_floor2_top: [3,1],
				
			});
			Crafty.sprite(48, 96, '../img/door.png', {
				spr_door: [0,0],				
			});
			Crafty.sprite(48, 72, '../img/f.png', {
				spr_f: [0,0],				
			});
			Crafty.sprite(48, 24, '../img/f.png', {
				spr_kb: [1,0],				
			});			
			Crafty.sprite(48, 48, '../img/save.png', {
				spr_save: [0,0],	
				spr_edit: [1,0],
				spr_shop: [0,1],
				spr_buy: [1,1],
				spr_sell: [0,2],
			});
			Crafty.sprite(480, 96, '../img/bag.png', {
				spr_bag: [0,0],	
			});		
			Crafty.sprite(24, 48, '../img/john.png', {
				spr_flag: [0,0],	
				spr_fan: [1,0],	
				spr_pot: [0,1],	
				spr_shelf: [2,0],	
				spr_sofa: [3,0],	
			});
			// download database
			if (userLogin) {
				// 抓錢的資料
				firebase.database().ref('/person/'+userLogin.uid).once('value').then(function(snapshot) {
					var dat = JSON.parse(JSON.stringify(snapshot.val()));
					if (!dat) {
						firebase.database().ref('person/' + userLogin.uid+'/money')
							.set(0)
							.catch(function(error){
								console.error("寫入使用者資訊錯誤",error);
							});
						money = 0;
						return;
					}
					money = dat['money'];
				});
				// 抓背包的資料
				firebase.database().ref('/bags/'+userLogin.uid).once('value').then(function(snapshot) {
					var dat = JSON.parse(JSON.stringify(snapshot.val()));
					for(key in dat){
						Game.bag[key] = Game.thing[dat[key]];
					}
				});
				// 抓房子的資料
				firebase.database().ref('/items/'+userLogin.uid).once('value').then(function(snapshot) {
					var dat = JSON.parse(JSON.stringify(snapshot.val()));
					for(key in dat){
						Game.item[key] = Game.thing[dat[key]];
					}
				});
				// 抓室友的資料
				firebase.database().ref('/users/'+userLogin.uid).once('value').then(function(snapshot) {
					var dat = JSON.parse(JSON.stringify(snapshot.val()))['roommate'];
					firebase.database().ref('/items/'+dat).once('value').then(function(snapshot) {	
						var _dat = JSON.parse(JSON.stringify(snapshot.val()));
						for(key in _dat){
							Game.item2[key] = Game.thing[_dat[key]];
						}
						Crafty.scene('Game');
					});
				});
			
			}
		});
});

var house = {x: 2, w: 13};
var house2 = {x: house.x+house.w+4, w:13};
var floor_top = Game.map_grid.height - 2;
			
var player_data = {x:3 ,y: floor_top-1};

var selector;
var player;
Crafty.scene('Game', function() {
	// Mobile Controler
	/*
	Crafty.e('Right, Actor, Color, Touch')
		.color('blue')
		.size(2,2)
		.at(1,2)
		.bind('TouchStart', function(TouchPoint){
			console.log("touch");
			player.trigger("KeyDown", {key: Crafty.keys.RIGHT_ARROW});
			player.trigger('KeyDown', Crafty.keys.A);
		});
	Crafty.e('Left, Actor, Color')
		.color('red')
		.size(2,2)
		.at(Game.map_grid.width-3,2);
	
	*/
	
	Crafty.e('2D, DOM, Text')
		.attr({x: 48, y: 24, w: 200, h: 20})
		.textFont({ size: '20px','font-weight':'light'})
		.text(money+" 鴨幣");
	Crafty.e('Editor');
	Crafty.e('Shoper');
	Crafty.e('CheckIner');
	
	/************ house init ************/
	for(var i=0;i < Game.map_grid.width;i++) {
		Crafty.e('BackGround').style('spr_floor_top').size(1,1).at(i,floor_top-1);
		Crafty.e('Floor').style('spr_floor').size(1,1).at(i,floor_top);
		Crafty.e('BackGround').style('spr_floor').size(1,1).at(i,floor_top+1);
	}

	for(var i=0;i < house.w+1;i++) {
		Crafty.e('BackGround').style('spr_wall2_top').size(1,1).at(house.x+i,6);
		Crafty.e('BackGround').style('spr_wall_top').size(1,1).at(house2.x+i,6);
	}

	for(var i=0;i<7;i++) {
		var bottom = floor_top-3;
		Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x,bottom-i);
		Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x+house.w,bottom-i);
		Crafty.e('Wall').style('spr_wall').size(1,1).at(house2.x,bottom-i);
		Crafty.e('Wall').style('spr_wall').size(1,1).at(house2.x+house2.w,bottom-i);
	}
	
	for(var i=0;i<2;i++) {
		var bottom = floor_top-1;
		Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x,bottom-i);
		Crafty.e('Wall').style('spr_wall').size(1,1).at(house2.x+house2.w,bottom-i);
	}
	Crafty.e('Door').style('spr_door').size(1,2).at(house.x+house.w, floor_top-1);
	Crafty.e('Door').style('spr_door').size(1,2).at(house2.x, floor_top-1);
	/************ house init end ************/	
	
	/************ furniture ************/
	for(var i=0;i<house.w-1;i++) {
		if(Game.item[i] != null)
			Crafty.e(Game.item[i].cmp)
				.style(Game.item[i].style)
				.size(Game.item[i].size.w,Game.item[i].size.h)
				.at(house.x+1+i, floor_top-1);
		if(Game.item2[i] != null)
			Crafty.e(Game.item2[i].cmp)
				.style(Game.item2[i].style)
				.size(Game.item2[i].size.w,Game.item2[i].size.h)
				.at(house2.x+1+i, floor_top-1);
	}
	
	/************ furniture  end ************/	


	player = Crafty.e('Player').onBindSelector(selector).size(2,2).at(player_data.x,player_data.y);

});

Crafty.scene('Edit', function() {

	
	/************ background init ************/
	{
		
		//Crafty.e('BK');
	}
	/************ house init ************/
	{
		for(var i=0;i < Game.map_grid.width;i++) {
			Crafty.e('BackGround').style('spr_floor_top').size(1,1).at(i,floor_top-1);
			Crafty.e('Floor').style('spr_floor').size(1,1).at(i,floor_top);
			Crafty.e('BackGround').style('spr_floor').size(1,1).at(i,floor_top+1);
		}

		for(var i=0;i < house.w+1;i++) {
			Crafty.e('BackGround').style('spr_wall2_top').size(1,1).at(house.x+i,6);
		}

		for(var i=0;i<7;i++) {
			var bottom = floor_top-3;
			Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x,bottom-i);
			Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x+house.w,bottom-i);
		}
		
		for(var i=0;i<2;i++) {
			var bottom = floor_top-1;
			Crafty.e('Wall').style('spr_wall2').size(1,1).at(house.x,bottom-i);
		}
		Crafty.e('Door').style('spr_door').size(1,2).at(house.x+house.w, floor_top-1);
	}
	
	/************ furniture ************/
	{
	for(var i=0;i<house.w-1;i++) {
		if(Game.item[i] != null)
			Crafty.e(Game.item[i].cmp+', Mouse')
				.setPro(Game.item[i])
				.style(Game.item[i].style)
				.size(Game.item[i].size.w,Game.item[i].size.h)
				.at(house.x+1+i, floor_top-1)
				.bind('MouseOver', function() {
					this.alpha = 1;
				}).bind('MouseOut', function() {
					this.alpha = 0.5;
				}).bind('DoubleClick', function() {
					for(key in Game.bag){
						if (Game.bag[key] == null){
							Game.bag[key] = this.tmp;
							Game.item[this.x / Game.map_grid.cell.width - house.x -1] = null;
							break;
						}
					}
					Crafty.scene('Edit');
				})
				.alpha = 0.5;
	}}
	
	/************ Game.bag init ************/
	{
		Crafty.e('Item')
			.style('spr_bag')
			.size(20, 4)
			.at(1, 4)
			.alpha = 0.2;
		var x = 2;
		for(var i=0;i<house.w;i++) {
			if(Game.bag[i] != null) {
				Crafty.e('Inbag')
					.style(Game.bag[i].style)
					.size(Game.bag[i].size.w,Game.bag[i].size.h)
					.setPro(Game.bag[i].cmp, Game.bag[i].style,Game.bag[i].size, i, Game.bag[i])
					.at(x, 4);
				x = x + Game.bag[i].size.w + 1;
			}
	}}

	Crafty.e('Saver');
	//selector = Crafty.e('Selector');
	player = Crafty.e('Player').onBindSelector(selector).size(2,2).at(player_data.x,player_data.y);
});

Crafty.scene('Shop', function() {
	/************ shop thing init ************/
	Crafty.e('2D, DOM, Text')
		.attr({x: 48, y: 12, w: 200, h: 20})
		.textFont({ size: '20px'})
		.text(money+" 鴨幣");
	
	var _selector = Crafty.e('_select');
	_selector.selected_item = null;
	{
		var x = 2;
		for(var i=0;i<house.w;i++) {
			if(Game.thing[i] != null) {
				Crafty.e('Product')
					.style(Game.thing[i].style)
					.size(Game.thing[i].size.w,Game.thing[i].size.h)
					.setPro(Game.thing[i].cmp, Game.thing[i].style,Game.thing[i].size, Game.thing[i].i, Game.thing[i].price, _selector)
					.at(x, 4);
				x = x + Game.thing[i].size.w + 1;
			}
	}}
	/************ Game.bag init ************/
	{
		Crafty.e('Item')
			.style('spr_bag')
			.size(20, 4)
			.at(1, 10)
			.alpha = 0.2;
		var x = 2;
		for(var i=0;i<house.w;i++) {
			if(Game.bag[i] != null) {
				Crafty.e('Shop_bag')
					.style(Game.bag[i].style)
					.size(Game.bag[i].size.w,Game.bag[i].size.h)
					.setPro(Game.bag[i].cmp, Game.bag[i].style, Game.bag[i].size, Game.bag[i].i, Game.bag[i].price, _selector, i)
					.at(x, 10);
				x = x + Game.bag[i].size.w + 1;
			}
	}}
	Crafty.e('Shop_Saver');
	
});

Crafty.scene('CheckIn', function() {
	var MAX_ARTICLES = 4;
	var articleID;
	
	Crafty.e('Home');
	
	// 確認是否登入
	if(!userLogin) {
		console.log('尚未登入。');
		alert('尚未登入。');
		return;
	}
	
	// input - 新增紀錄
	Crafty.e('HTML')
		.attr({x: 1 * Game.map_grid.cell.width, y: 3 * Game.map_grid.cell.height, w: 10 * Game.map_grid.cell.width})
		.append('<form> \
		<label for="song"> 歌曲 </label> <br/>\
		<input id="song" class="article_input" type="text" autocomplete="off"> <br/>\
		<label for="song"> 進度 </label> <br/>\
		<input id="progress" class="article_input" type="text" autocomplete="off">	<br/> \
		<button type="button" id="SendBtn"> 送出 </button> \
		</form>');
	var song = document.getElementById("song");
	var progress = document.getElementById("progress");
	

	// TODO: 簽到獎勵紀錄
	Crafty.e('CheckIn_Block')
		._update();
	// 印出最近五則簽到記錄
	var articleE = new Array(MAX_ARTICLES);
	for(var i = 0; i < MAX_ARTICLES ; i++) {
		var _atom = {};
		var _attr = 
		_atom.time = Crafty.e('2D, DOM, HTML')
			.attr({x: 23 * Game.map_grid.cell.width, y: (3+i*3) * Game.map_grid.cell.height, w: 10 * Game.map_grid.cell.width})
			.css({'color':'gray',
				'textAlign':'left',
				'fontSize':'10px'});
		_atom.title = Crafty.e('2D, DOM, HTML')
			.attr({x: 23 * Game.map_grid.cell.width, y: (4+i*3) * Game.map_grid.cell.height - 10, w: 10 * Game.map_grid.cell.width, h:Game.map_grid.cell.height+5})
			.css({'fontSize':'18px',
				'textAlign':'left',
				'fontWeight':'bold',
				'overflow':'auto'});
		_atom.progress =  Crafty.e('2D, DOM, HTML')
			.attr({x: 23 * Game.map_grid.cell.width, y: (5+i*3) * Game.map_grid.cell.height - 10, w: 10 * Game.map_grid.cell.width, h: Game.map_grid.cell.height*2 })
			.css({'fontSize':'13px',
				'textAlign':'left',
				'overflow':'auto'});
		articleE[i] = _atom;
	}
		
	firebase.database().ref('person/' + userLogin.uid + '/newest/')
		.once('value')
		.then(function(snapshot) {
			var dat = JSON.parse(JSON.stringify(snapshot.val()));
			var i = 0;
			for(key in dat) {
				if(i >= MAX_ARTICLES)
					break;
				var _time = new Date(dat[key].setAt);
				articleE[i].time.append(""+_time.toLocaleString()+"");
				articleE[i].title.append(dat[key].song);
				if (dat[key].progress) 
					articleE[i].progress.append("+ " + dat[key].progress);
				i++;
			}
		}).catch(function(error) {
			console.error("下載最新文章時發生錯誤(0) : ", error);
		});
	
		
	// button ckick event
	document.getElementById('SendBtn').addEventListener('click', function() {
		var d = new Date();		
		var upload_dat = {
			song: song.value,
			progress: progress.value,
			setAt: firebase.database.ServerValue.TIMESTAMP
		}
		
		// 上傳剛剛輸入的訊息
		if (song.value != "") {
			// save under articles/
			var _key = firebase.database().ref('articles/'+userLogin.uid+"/"+d.getFullYear()+"/"+d.getMonth())
				.push(upload_dat)
				.then(function(snap) {
					articleID = snap.key;
					update_db();
				}).catch(function(error) {
					console.error("上傳最新文章時發生錯誤(0) : ",error);
				});
				
			// update person/newest/	
			function update_db() {
				firebase.database().ref('person/' + userLogin.uid + '/articles_count')
					.transaction(function(dat) {
						console.log(dat);
						if (dat != null) {
							
							dat = dat + 1;
							if (dat > MAX_ARTICLES) {
								// 移除最先加進去的資料
								firebase.database().ref('person/' + userLogin.uid + '/newest/').limitToFirst(1)
									.once('value')
									.then(function(snapshot) {
										var deleteID = Object.keys(snapshot.val())[0];
										firebase.database().ref('person/' + userLogin.uid + '/newest/' + deleteID)
											.remove();
											
										// 新增資料
										firebase.database().ref('person/' + userLogin.uid + '/newest/' + articleID)
											.set(upload_dat)
											.then(function() {
												// 重新刷新景
												console.log('hi');
												Crafty.scene('CheckIn');
											})
											
											.catch(function(error) {
												console.error("更新最新文章時發生錯誤(1) ",error);
											});
										
									})
									
									.catch(function(error) {
										console.error("更新最新文章時發生錯誤(0) : ",error);
									});
									
							} else {
								// 新增資料
								firebase.database().ref('person/' + userLogin.uid + '/newest/' + articleID)
									.set(upload_dat)
									.then(function() {
										Crafty.scene('CheckIn');
									})
									.catch(function(error) {
										console.error("更新最新文章時發生錯誤(1) ",error);
									});
									
									
							}
						}
						return dat;
					})
					.catch(function(error) {
						console.error("更新最新文章時發生錯誤(2) ",error);
					});
					
				// 印出上傳訊息
				document.getElementById('msg').innerHTML = " \
				【系統】紀錄上傳成功<br/>" + document.getElementById('msg').innerHTML
			}
		}
		
	});
	
	
});