(function(){
	var Waterfall = function(options){
		this.opt = options || {};
		this.wrap = this.opt.wrap;
		this.childClass = this.opt.childClass || "box";
		this.child = this.getChild(this.wrap, this.childClass);
		this.childWidth = this.child[0].offsetWidth;
		this.cols = Math.floor(document.documentElement.clientWidth / this.childWidth);
		this.hArr = [];								//存放每列的高度
		this.url = this.opt.url;					//数据请求url
		this.loadCount = this.opt.loadCount || 30;  //每次加载数量
		this.flag = true;
		this.init();
	}
	Waterfall.prototype = {
		init: function(){
			var self = this;
			//初始化容器宽度和位置
			this.initialWrap();
			//初始化瀑布流布局
			this.waterfall();
			//绑定滚动事件
			window.addEventListener("scroll", function(){
				if(self.scrollToBottom() && self.flag){
					self.flag = false;
					self.loadData(self.url);
				}
			}, false);
		},
		initialWrap: function(){
			this.wrap.style.width = this.childWidth * this.cols + "px";
			this.wrap.style.margin = "0 auto";
		},
		loadData: function(url){
			var self = this;
			var xhr = new XMLHttpRequest();
			
			xhr.onreadystatechange = function(){
				if(xhr.readyState === 4){
					if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
						self.addBox(xhr.responseText);
					}
				}
			}

			xhr.open("get", url, true);
			xhr.send();
		},
		addBox: function(response){
			var data = JSON.parse(response).data;
			this.renderData(data);
		},
		renderData: function(data){
			var self = this;
			var frag = document.createDocumentFragment();

			data.forEach(function(val, index){
				var box = document.createElement("div");
				box.className = "box";
				frag.appendChild(box);
				var imgbox = document.createElement("div");
				imgbox.className = "imgbox";
				box.appendChild(imgbox);
				var img = new Image();
				img.src = "images/" + val.src;
				img.onload = function(){
					imgbox.appendChild(img);
					if(index === data.length - 1){
						self.wrap.appendChild(frag);
						self.waterfall();
						self.flag = true;
					}
				}
			});
		},
		waterfall: function(){
			this.child = this.getChild(this.wrap, this.childClass);
			this.hArr = [];
			for(var i = 0, len = this.child.length; i < len; i++){
				if(i < this.cols){
					this.hArr.push(this.child[i].offsetHeight);
				}else{
					var minHeight = Math.min.apply(null, this.hArr);
					var minIndex = this.getIndex(this.hArr, minHeight);
					this.child[i].style.position = "absolute";
					this.child[i].style.top = minHeight + "px";
					this.child[i].style.left = this.childWidth * minIndex + "px";
					this.hArr[minIndex] += this.child[i].offsetHeight;
				}
			}
		},
		getChild: function(wrap, className){
			var all = wrap.getElementsByTagName('*');
			var reg = new RegExp("(^|\\s+)" + className + "(\\s+|$)");
			var res = [];

			for(var i = 0, len = all.length; i < len; i++){
				if(reg.test(all[i].className)){
					res.push(all[i]);
				}
			}
			return res;
		},
		getIndex: function(arr, minHeight){
			return arr.indexOf(minHeight);
		},
		scrollToBottom: function(){
			var clientHeight = document.documentElement.clientHeight || document.body.clientHeight,
				scrollHeight = document.documentElement.scrollTop || document.body.scrollTop,
				len = this.child.length,
				lastChild = this.child[len - 1],
				lastBoxH = lastChild.offsetTop + Math.floor(lastChild.offsetHeight/2);
		
			return (clientHeight + scrollHeight > lastBoxH) ? true : false;
		}
	}
	window.Waterfall = Waterfall;
})();
