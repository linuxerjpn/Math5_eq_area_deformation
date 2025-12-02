/* vim:set foldmethod=marker: */

/**
 * @fileOverview 小学校５年生の算数　図形の単元で、等積変形をブラウザ上で実現する.
 * 最初はjavaベースのProcessing言語で開発していたが、Processingの文法をある程度はそのまま
 * 流用できるので、javascript言語ベースのp5js言語で開発. <br/>
 * ～備忘録～<br/>
 * ■図形の移動には、それぞれの図形で内外判定をする必要がある.<br/>
 * 内外判定は、マウスクリックした任意の点に対して、図形ごとにすべての頂点に対して、角度を計算して合算する.
 * 合算した結果が0付近ならば外という感じ。<br />
 * ■カットする際、交点の候補を求めるときはベクトル方程式を解けばOK.<br/>
 * ■図形が回転するのはアフィン変換<br/>
 * @author MURAYAMA, Yoshiyuki
 * @version 1.0.0
 * @link https://www.youtube.com/watch?v=DXajm0sHfp0
 * @link https://www.nttpc.co.jp/technology/number_algorithm.html
 * @link https://mikebird28.hatenablog.jp/entry/2020/09/23/002409
 * @link https://imagingsolution.net/math/calc_n_point_area/
 * @link https://oguemon.com/study/linear-algebra/inner-cross-element/
 */
 
/** カットモード時に候補の●を表示させる.  calcVectorEquation @type {const} */
const DISP_MODE = 1;   
/** カットモードで本当にカットする.calcVectorEquation @type {const}*/
const DIVIDE_MODE = 2;  



/** ブラウザの画面の横幅いっぱい.
 * @type {Number}
 */
var iWidth = window.innerWidth;
/** ブラウザの画面の縦幅いっぱい. 
 * @type {Number} 
 */
var iHeight = window.innerHeight;
/** 各頂点のそばなら回転させるが、その範囲のピクセル. 
 * @type {Number}
 */
var iRotatingRegion = 25; 
/** trueなら回転中なので、マウスが iRotationRegionから離れても移動しない. 
 * @type {boolean} 
 */
var isRotatingLock = false;
/** 図形を分割したり作成したりするので、クラスのインスタンス配列. 
 * @type {Array} 
 */
var zukei = new Array();
/** 図形追加用のボタン. 
 * @type {Object}
 */
var btnAdd;		
/** 図形追加モードか、そうでないかの判別用. 
 * @type {boolean}
 */;
var isAddMode;
/** 図形追加モードのデータ. 
 * @type {Array}
 */
var newShape = new Array();
/** 頂点の数. 
 * @type {Number}
 */
var iVertexNum = 0;

/** カットする用のボタン. 
 * @type {Object} 
 */
var btnCut;
/** カットモードかの判別用. 
 * @type {boolean}
 */
var isCutMode;
/** カットモードで始点(1)か終点(2)かの状態保存用.
 * @type {number}
 */
var iShitenSyuten;
/** カットモードで始点と終点の座標.
 * @type {Vector}
 */
var vShiten, vSyuten;	
/** ひし形の図形学習用.
 * @type{Object} 
 */
var btnHishigata;
/** ひし形学習用のモードかの判別用.
 * @type{boolean}
 */
var isHishigataMode;

/**  三角形の図形学習用.
 * @type{Object}
 */
var btnNormalTriangle;
/** 三角形学習用のモードかの判別用.
 * @type{boolean}
 */
var isNormalTriangleMode;

/** 三角形の図形学習用.
 * @type{Object}
 */
var btnTriangle;
/**  三角形学習用のモードかの判別用
 * @type{boolean}
 */
var isTriangleMode;
/** 平行四辺形の図形学習用.
 * @type{Object}
 */
var btnParallelogram;
/** 平行四辺形学習用のモードかの判別用.
 * @type{boolean} 
 */
var isParallelogramMode;
/** 台形の図形学習用.
 * @type{Object}
 */
var btnTrapezoid;
/** 台形学習用のモードかの判別用.
 * @type{boolean}
 */
var isTrapezoidMode;

/** 五角形の図形学習用
 * @type{Object}
 */
var btnPentagon;
/** 五角形学習用のモードかの判別用 
 * @type {boolean}
*/
var isPentagon;

/** 六角形の図形学習用
 * @type{Object}
 */
var btnHexagon;
/** 六角形学習用のモードかの判別用 
 * @type {boolean}
*/
var isHexagon;

/** 七角形の図形学習用
 * @type{Object}
 */
var btnSeptagon;
/** 七角形学習用のモードかの判別用 
 * @type {boolean}
*/
var isSeptagon;



/** 交点がある場合は、複数の図形が対象になることがあるので、対象となった図形番号.
 * @type{Array}
 */
var CrossZukeiNum = new Array(); 
/** 交点がある場合は、対象の図形番号に対して、交点の座標を入れておく.
 * @type{Array}
 */
var CrossPoints = new Array();   
/** 交点がある場合h、何番目の頂点にあったのかを入れておく.
 * @type{Array}
 */
var CrossPointsLocation = new Array();	

var ptouchX = 0;	//pmouseXのような過去をとるものないので.
var ptouchY = 0;	//pmouseYのような過去をとるものがないので.

var isPC;		//trueの時はPC falseの時はスマホ

var dblClickCounter = 0;//ダブルクリックの検出用

/** @type{Object} グリッド線のチェックボックス. */
var chkbox;
/** @type{boolean} グリッド線のチェックボックスがオンかオフか. */
var isGridChecked;

/** setup()関数の先頭に記述してあるため、setup()よりも先に呼び出される.
 * スマホ・タブレット（iOS・Android）か、PCかをuserAgentを調べることで、判別する.
 * これにより、isPCにtrueかfalseが入るため、これ以降のプログラムでは、isPCを見れば、
 * PCかどうかがわかる.
 */
function preload() { /** {{{*/
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
		// スマホ・タブレット（iOS・Android）の場合の処理を記述
		isPC = false;
	}else{
		// PCの場合の処理を記述
		isPC = true;
	}
	// setupより先に実行
	//font = loadFont("Meiryo.ttf");
}
/**}}}*/


let crossX,crossY;//交点

/** 最初に1回だけ実行. 初期値の図形情報を詰め込むのはここ.
 * 図形情報はVector配列の集合体を、Zukeiクラスのインスタンスを配列で管理している.
 */
function setup(){ /** {{{*/
	preload();
	//スマホ画面で下に移動すると、更新してしまう問題を回避
	window.addEventListener("touchstart", function (event) { event.preventDefault(); }, { passive: false });
	window.addEventListener("touchmove", function (event) { event.preventDefault(); }, { passive: false });
	
	cursor('pointer');
	//キャンバスを作成
	textSize(30);
	fill( 0, 0, 255 );
	createCanvas(iWidth, iHeight);
	drawBackground();
	//textFont(font);

	/** 図形を宣言する.
	 * 図形は、Zukeiクラスのプロパティに、ArrayList<PVector>クラスとして、
   	 * 宣言しているので、多角形に対応している.
     * 内部的には、vertexを beginShapeで、CLOSEしているので、元の座標は頂点に入れなくても良い.
	*/
	let pvTriangle = new Array();
	pvTriangle.push( createVector( 130,  30, 0 ) );
	pvTriangle.push( createVector( 200, 200, 0 ) );
	pvTriangle.push( createVector( 110, 200, 0 ) );

	let pvTrapezoid = new Array();
	pvTrapezoid.push( createVector( 200, 130, 0 ) );
	pvTrapezoid.push( createVector( 400, 130, 0 ) );
	pvTrapezoid.push( createVector( 500, 300, 0 ) );
	pvTrapezoid.push( createVector( 150, 300, 0 ) );

	let pvPentagon = new Array();
	pvPentagon.push( createVector( 300, 100, 0) );
	pvPentagon.push( createVector( 350, 100, 0) );//4
	pvPentagon.push( createVector( 400, 200, 0) );//3
	pvPentagon.push( createVector( 250, 200, 0) );//2
	pvPentagon.push( createVector( 200, 150, 0) );//1

	zukei.push( new Zukei( 0, 100, 50, pvTriangle ) );
	zukei.push( new Zukei( 2, 200, 100, pvPentagon ) );
	zukei.push( new Zukei( 1, 400, 50, pvTrapezoid ) );

	//ボタンを作成する.
	isCutMode = false;	//カットモードではない.
    
	btnCut = createButton('カットモード');
	btnCut.position(30,30);
	btnCut.mousePressed( cutter );
    
	//ボタンを作成する.
	isAddMode = false;	//図形追加モードではない.
	btnAdd = createButton('図形追加モード');
	btnAdd.position(30+50+btnCut.width, 30);
	btnAdd.mousePressed( adder );

	//菱形putボタンを作成する.
	isHishigataMode = false;
	btnHishigata = createButton('ひし形学習モード');
	btnHishigata.position(30+50*2+btnCut.width+btnAdd.width, 30);
	btnHishigata.mousePressed( putHishigata );

	iShitenSyuten = 0;
	vShiten = createVector(0,0);
	vSyuten = createVector(0,0);

	//グリッド線を出力する.[基本的には、ひし形用]
	chkbox = createCheckbox('グリッド', false);
	chkbox.position(30,30 + 10 + btnCut.height);
	chkbox.changed(chkboxevent);
	isGridChecked = false;

	//三角形ボタンを作成する.
	isTriangleMode = false;
	btnTriangle = createButton('三角形学習モード');
	btnTriangle.position( 30 + 50+btnCut.width, 30 + 10 + btnCut.height );
	btnTriangle.mousePressed( putTriangle );


	//平行四辺形ボタンを作成する.
	isParallelogramMode = false;
	btnParallelogram = createButton('平行四辺形学習モード');
	btnParallelogram.position( 30+50*2+btnCut.width+btnAdd.width, 30 + 10 + btnCut.height );
	btnParallelogram.mousePressed( putParallelogram );
	//台形ボタンを作成する.
	isTrapezoideMode = false;
	btnTrapezoid = createButton('台形学習モード');
	btnTrapezoid.position( 30 + 50 * 3 + btnCut.width + btnAdd.width + btnHishigata.width, 30 + 10 + btnCut.height  );
	btnTrapezoid.mousePressed( putTrapezoid );

	//普通の三角形ボタンを作成する.
	isNormalTriangleMode = false;
	btnNormalTriangle = createButton('普通の三角形学習モード');
	btnNormalTriangle.position( btnTrapezoid.x , 30 );
	btnNormalTriangle.mousePressed( putNormalTriangle );

	//五角形のボタンを作成する.
	isPentagon = false;
	btnPentagon = createButton('五角形');
	btnPentagon.position(30,30+10+btnCut.height+30+10);
	btnPentagon.mousePressed( putPentagon );
    
	//六角形のボタンを作成する.
	isHexagon = false;
	btnHexagon = createButton('六角形');
	btnHexagon.position(30 + 50 + btnCut.width,30+10+btnCut.height+30+10);
	btnHexagon.mousePressed( putHexagon );
    
	//七角形のボタンを作成する.
	isSeptagon = false;
	btnSeptagon = createButton('七角形');
	btnSeptagon.position(30 + 50 + btnCut.width + btnHexagon.width + 105,30+10+btnCut.height+30+10);
	btnSeptagon.mousePressed( putSeptagon );
    
}
/**}}}*/

function chkboxevent() {
	isGridChecked = chkbox.checked();
}

/** 図形分割モードにする.
 * isCutModeの真偽で図形分割モードかを判別している.カットモードと、図形追加モードは排他的なので、ここを通ると必ずisAddModeはfalseとなる.
 */
function cutter() { /** {{{*/
    if (isCutMode == false) {
        iShitenSyuten = 0;
    }
	clearMode("isCutMode =", !isCutMode);
}
/**}}}*/

/** 他のモードで何かをしていても全てクリアする.一種のスイッチ
 * 自分自身のモードではクリアしない.これでボタンを新しく追加してもclearModeさえ入れておけば、
 * 意識しなくてもよい. グリッドについては、ここではクリアしない.
 * @param varName 除外するモード
 * @param bStatus varNameの反転後の変数がtrue かfalseか.
 */
function clearMode( varName, bStatus ) {
	isCutMode = isAddMode = isHishigataMode = isTriangleMode = isTrapezoidMode = isParallelogramMode = isNormalTriangleMode = isPentagon = isHexagon = isSeptagon = false;
	eval(varName + bStatus);
}

/** 菱形の学習モード.
 * 菱形学習のために、グリッドも出力する.
 */
function putHishigata() { /** {{{*/
	console.log("菱形学習");
	zukei.splice( 0, zukei.length );//これまでの図形を全て削除
	let pvHishigata = new Array();
	pvHishigata.push( createVector( 400, 200, 0 ));
	pvHishigata.push( createVector(  80, 360, 0 ));
	pvHishigata.push( createVector( 400, 520, 0));
	pvHishigata.push( createVector( 720, 360, 0));
	zukei.push( new Zukei( 3, 0, 0, pvHishigata ) );
	clearMode("isHishigataMode=", !isHishigataMode);//他のモードだったとしてもクリアする.
	isGridChecked = true;
}
/**}}}*/

/** 平行四辺形の学習モード.
 * 平行四辺形学習のために、グリッドも出力する.
 */
function putParallelogram() { /** {{{ */
	console.log("平行四辺形の学習モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除
	let pvParallelogram = new Array();
	pvParallelogram.push( createVector(  80, 200, 0) );
	pvParallelogram.push( createVector( 240, 520, 0) );
	pvParallelogram.push( createVector( 720, 520, 0) );
	pvParallelogram.push( createVector( 560, 200, 0) );
	zukei.push( new Zukei( 3, 0, 0, pvParallelogram ) );
	clearMode("isParallelogramMode=", !isParallelogramMode);//他のモードだったとしてもクリアする.
	isGridChecked = true;
}
/**}}}*/

/** 三角形の学習モード.
 * 三角形学習のために、グリッドも出力する.
 */
function putTriangle() { /** {{{*/
	console.log("三角形の学習モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除
	let pvTriangle = new Array();
	pvTriangle.push( createVector( 560, 200, 0) );
	pvTriangle.push( createVector(  80, 520, 0) );
	pvTriangle.push( createVector( 560, 520, 0) );
	zukei.push( new Zukei( 3, 0, 0, pvTriangle ) );
	clearMode("isTriangleMode=", !isTriangleMode);//他のモードだったとしてもクリアする.
	isGridChecked = true;

}
/** }}}*/

function putNormalTriangle() { /** {{{*/
	console.log("普通の三角形の学習モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除
	let pvNormalTriangle = new Array();
	pvNormalTriangle.push( createVector( 400, 200, 0) );
	pvNormalTriangle.push( createVector(  80, 520, 0) );
	pvNormalTriangle.push( createVector( 560, 520, 0) );
	zukei.push( new Zukei( 3, 0, 0, pvNormalTriangle ) );
	clearMode("isNormalTriangleMode=", !isNormalTriangleMode);//他のモードだったとしてもクリアする.
	isGridChecked = true;

}
/** }}}*/


/** 台形の学習モード.
 * 台形学習のために、グリッドも出力する.
 */
function putTrapezoid() { /** {{{*/
	console.log("台形の学習モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除
	let pvTrapezoid = new Array();
	pvTrapezoid.push( createVector( 400, 200, 0 ) );
	pvTrapezoid.push( createVector(  80, 520, 0 ) );
	pvTrapezoid.push( createVector( 800, 520, 0 ) );
	pvTrapezoid.push( createVector( 640, 200, 0 ) );
	zukei.push( new Zukei( 3, 0, 0, pvTrapezoid ) );
	clearMode("isTrapezoidMode=", !isTrapezoidMode);//他のモードだったとしてもクリアする.
	isGridChecked = true;

}
/**}}}*/

function putPentagon() {
	console.log("五角形モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除

	let pvPentagon = new Array();
	pvPentagon.push( createVector( 160+400, 0+300, 0 ) );
	pvPentagon.push( createVector(  49+400, 152+300, 0 ) );
	//pvPentagon.push( createVector( 800, 520, 0 ) );
	pvPentagon.push( createVector( -129+400, 94+300, 0 ) );
	pvPentagon.push( createVector( -129+400, -94+300, 0 ) );
	pvPentagon.push( createVector( 49+400, -152+300, 0 ) );
	zukei.push( new Zukei( 3, 0, 0, pvPentagon ) );
	clearMode("isPentagon=", !isPentagon);//他のモードだったとしてもクリアする.
	isGridChecked = false;
}

function putHexagon() {
	console.log("六角形モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除

	let pvHexagon = new Array();
	pvHexagon.push( createVector( 160+400, 0+300, 0 ) );
	pvHexagon.push( createVector(  80+400, 139+300, 0 ) );
	pvHexagon.push( createVector( -80+400, 139+300, 0 ) );
	pvHexagon.push( createVector( -160+400, 0+300, 0 ) );
	pvHexagon.push( createVector( -80+400, -139+300, 0 ) );
	pvHexagon.push( createVector( 80+400, -139+300, 0 ) );
	
	zukei.push( new Zukei( 3, 0, 0, pvHexagon ) );
	clearMode("isHexagon=", !isHexagon);//他のモードだったとしてもクリアする.
	isGridChecked = false;
}

function putSeptagon() {
	console.log("七角形モード");
	zukei.splice(0, zukei.length);//これまでの図形を全て削除

	let pvSeptagon = new Array();
	pvSeptagon.push( createVector( 160+400, 0+300, 0 ) );
	pvSeptagon.push( createVector(  100+400, 125+300, 0 ) );
	//pvPentagon.push( createVector( 800, 520, 0 ) );
	pvSeptagon.push( createVector( -36+400, 156+300, 0 ) );
	pvSeptagon.push( createVector( -144+400, 69+300, 0 ) );
	pvSeptagon.push( createVector( -144+400, -69+300, 0 ) );
	pvSeptagon.push( createVector( -36+400, -156+300, 0 ) );
	pvSeptagon.push( createVector( 100+400, -125+300, 0 ) );
	zukei.push( new Zukei( 3, 0, 0, pvSeptagon ) );
	clearMode("isSeptagon=", !isSeptagon);//他のモードだったとしてもクリアする.
	isGridChecked = false;
}


/**図形追加モードにする.
 * isAddmodeの真偽で図形追加モードかを判別している.図形追加モードと、カットモードは排他的なので、ここを通ると必ずisCutModeはfalseとなる.
 */
function adder() { /** {{{*/
	if ( isAddMode == false ) {
		//これまでの入っているゴミをクリアするところかな.
		iVertexNum = 0;
		newShape = [];
		dblClickCounter = 0;	//ダブルクリックの検出もクリア
	}
	clearMode("isAddMode = ", !isAddMode);//他のモードだったとしてもクリアする.
}
/**}}}*/


/** マウスやタッチパッドがドラッグされたら.
 * PCとスマホでは、マウスとタッチパッドが異なるため、
 * mouseX pmouseXとかが touchX ptouchXに変えないといけない。
 * それぞれのメソッドを準備すると、大変なので、
 * ここに送る前にmouseX等を取得しておき、ここに送るときに引数として処理する.
 * @param pinputX pmouseXか、ptouchXのどっちか.
 * @param pinputY pmouseYか、ptouchYのどっちか.
 * @param inputX mouseXか、touches[0].xのどっちか.
 * @param inputY mouseYか、touches[0].yのどっちか.
 */
function dragProcess( pinputX, pinputY, inputX, inputY ) { /** {{{*/
	if ( isCutMode == false && isAddMode == false ) {	//分割モードがoffだったら.
		dragProcessCutModeOff( pinputX, pinputY, inputX, inputY );
	} else {

	}
}
/** }}}*/


/** マウスがドラッグされたら.ただし、カットモードではない.
 * PCとスマホでは、マウスとタッチパッドが異なるため、
 * mouseX pmouseXとかが touchX ptouchXに変えないといけない。
 * それぞれのメソッドを準備すると、大変なので、
 * ここに送る前にmouseX等を取得しておき、ここに送るときに引数として処理する.
 * @param pinputX pmouseXか、ptouchXのどっちか.
 * @param pinputY pmouseYか、ptouchYのどっちか.
 * @param inputX mouseXか、touches[0].xのどっちか.
 * @param inputY mouseYか、touches[0].yのどっちか.
 */
function dragProcessCutModeOff( pinputX, pinputY, inputX, inputY ) { /** {{{*/
	var iSelectedNum = -1;
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		if ( zukei[iCounter].isSelected == true ) {
			iSelectedNum = iCounter;
		}
	}
	//選択状態ではなかったら何もしない.
	if ( iSelectedNum == -1 ) {
		return;
	}
	//移動モードか回転モードかを判断する.
	for ( var iCounter = 0; iCounter < zukei[iSelectedNum].pvec[0].length; iCounter++ ) {
		if (
			dist(
				inputX,
				inputY,
				zukei[iSelectedNum].pvec[0][iCounter].x,
				zukei[iSelectedNum].pvec[0][iCounter].y
			) <= iRotatingRegion ) {
			/** 各頂点の20ピクセル(iRotatingRegion)以内にあった.*/
			isRotatingLock = true;
		}
	}

	var iXOffset = pinputX - inputX;
	var iYOffset = pinputY - inputY;

	if ( isRotatingLock == true  ) {
		cursor( CROSS ); 
		//回転させる.
		push()
		zukei[iSelectedNum].rotateOffset( pinputX, pinputY, inputX, inputY );
		pop();
	} else {
		cursor( 'move'  );
		//移動させる/
		//選択状態なので、頂点のそばでなかったら対象の図形を移動させる/.
		zukei[iSelectedNum].moveOffset( iXOffset, iYOffset );

	}
	//console.log(iSelectedNum);

}
/** }}}*/

/** マウスがドラッグされたら.
 * 図形外の時は、何もしない.
 * 図形内の時は、ドラッグすれば対象図形のみが移動し、レイヤーを最前列にする.
 * 図形内外で、各頂点から、許容量以内の場合は回転モードにする.
 * mousePressed()メソッドで、どの図形を選択しているかの情報は得ているので、
 * 回転か移動かの判断はここのメソッドだけで判断してもよい.
 */
function mouseDragged() { /** {{{*/
	dragProcess(pmouseX, pmouseY, mouseX, mouseY);
}
/** }}}*/

/** マウスのドラッグが終わったら*/
function mouseReleased() { /** {{{*/
	if ( isCutMode == false ) { //分割モードがoffだったら.
		cursor('pointer');
		isRotatingLock = false;
	} else {

	}
}
/**}}}*/


/** 図形が重なった時はどちらがレイヤ的に上に来るのかを判別するために、
 * Zukeiクラスには、iLayerというレイヤ番号が順番となっている.
 * レイヤの概念は描画順と同義のため、配列をiLayerの順番に並び替えると、
 * その順番で重なった図形となる.
 */
function sortZukei() { /** {{{*/
	zukei.sort( function( a, b ) {
		return a.iLayer - b.iLayer;
	});
}
/**}}}*/


/** mousePressedイベント. もしかしたらtouchとかも考えないといけないかもしれないから、一応分割した.
 * @param pinputX pmouseXか、ptouchXのどっちか.		@type {Number}
 * @param pinputY pmouseYか、ptouchYのどっちか.		@type {Number}
 * @param inputX mouseXか、touches[0].xのどっちか.	@type {Number}
 * @param inputY mouseYか、touches[0].yのどっちか.	@type {Number}
 */
function pressProcess( pinputX, pinputY, inputX, inputY  ) { /** {{{*/
	console.log("モード: isCutmode=" + isCutMode + "isAddMode=" + isAddMode);
	if ( isCutMode == false && isAddMode == false ) {	//分割モードがoffで、図形追加モードがオフの場合
		pressProcessCutModeOff( pinputX, pinputY, inputX, inputY );
	} else if ( isCutMode == true && isAddMode == false ) {	//分割モード
		pressProcessCutModeOn( pinputX, pinputY, inputX, inputY );
	} else if ( isCutMode == false && isAddMode == true ) {	//図形追加モード
		pressProcessAddModeOn( pinputX, pinputY, inputX, inputY );
	}
}
/**}}}*/

/** 図形追加モードがオンの時のプロセス. ダブルクリックはsetTimeoutで定義している.
 * @param pinputX pmouseXか、ptouchXのどっちか.    @type {Number}
 * @param pinputY pmouseYか、ptouchYのどっちか.    @type {Number}
 * @param inputX mouseXか、touches[0].xのどっちか. @type {Number}
 * @param inputY mouseYか、touches[0].yのどっちか. @type {Number}
 */
function pressProcessAddModeOn( pinputX, pinputY, inputX, inputY  ) { /** {{{*/
	//ダブルクリックの検出
	if (!dblClickCounter) {
		//クリックの回数+1
		++dblClickCounter;
		//300ミリ秒以内に２回目のクリックがされればダブルクリックと判定
		setTimeout( function() {
			dblClickCounter = 0;
		}, 300);
		if ( iVertexNum == 0 ) { //初回のポイントは図形追加モードボタン当たりになってしまうので、pushしないが、点は打ってあげる.
		} else { 
			newShape.push( createVector( inputX, inputY, 0 ) );
		}
		iVertexNum++;
		console.log(newShape);
	} else { //ダブルクリックなので、図形を作り、図形追加モードを抜ける.
		if ( newShape.length >= 3 ) { //3角形以上じゃないと意味がない.
			zukei.push( new Zukei( zukei.length, 0, 0, newShape ) );
			newShape = [];
		}
		isAddMode = !isAddMode;
	}
}
/**}}}*/

/** カットモードがオンの時のプロセス. ダブルクリックはsetTimeoutで定義している.
 * @param pinputX pmouseXか、ptouchXのどっちか.    @type {Number}
 * @param pinputY pmouseYか、ptouchYのどっちか.    @type {Number}
 * @param inputX mouseXか、touches[0].xのどっちか. @type {Number}
 * @param inputY mouseYか、touches[0].yのどっちか. @type {Number}
 */
function pressProcessCutModeOn( pinputX, pinputY, inputX, inputY) { /** {{{*/
	if ( iShitenSyuten >= 3 ) {
		iShitenSyuten = 0;
	}

	if (iShitenSyuten == 0 ) {
		//console.log("始点を選択してください.");
	} else if ( iShitenSyuten == 1 ) {
		//始点を選択済み.
		vShiten.x = inputX;
		vShiten.y = inputY;
		//console.log("始点＝("+ vShiten.x + ","+ vShiten.y+")終点を選択してください。" );
        //点線を出力しておく.
	} else if ( iShitenSyuten == 2 ) {
		vSyuten.x = inputX;
		vSyuten.y = inputY;
		//console.log("始点＝("+ vShiten.x + ","+ vShiten.y+") 終点＝（"+ vSyuten.x + ","+ vSyuten.y+"）" );
		//全ての図形番号で改めて交点を求める.
        for ( let jCounter = 0; jCounter < zukei.length; jCounter++) {
            for ( let iCounter = 0; iCounter < zukei[jCounter].pvec[0].length -1; iCounter++) {
                calcVectorEquation(DIVIDE_MODE, jCounter, iCounter, iCounter+1, vShiten.x, vShiten.y, vSyuten.x, vSyuten.y);
            }
            calcVectorEquation(DIVIDE_MODE, jCounter, zukei[jCounter].pvec[0].length-1, 0, vShiten.x,vShiten.y,vSyuten.x,vSyuten.y);
            //ここで分割する. MaxなiLayerが必要.
			//分割座標が何番目と何番目の間にあるかを取得する.

			let dividePointStartNum=[]; //分割開始点の頂点番号
			let dividePointEndNum=[];   //分割終了点の頂点番号
			for ( let kCounter = 0; kCounter < CrossPoints.length; kCounter++ ) {
				dividePointStartNum.push(CrossPointsLocation[kCounter]);
				dividePointEndNum.push( (CrossPointsLocation[kCounter] + 1 ) % zukei[jCounter].pvec[0].length );
				console.log("図形%dの交点座標は(%f, %f)であり、その交点は頂点%dと頂点%dの間にある。",
					jCounter,
					CrossPoints[kCounter].x,
					CrossPoints[kCounter].y,
					dividePointStartNum[kCounter],
					dividePointEndNum[kCounter]
				);
			}
			//分割ルーチン
			//指定の頂点は何頂点分なのか調べる.
			let DividePointsNum;	//交点から交点まで、いくつの頂点があるのかを取得する.0が入るのが厄介.
			if ( dividePointEndNum == 0 ) {	//0番目ならばそのまんま頂点削除できない.
				
			} else {	//そのまま頂点削除ができそう.
				DividePointsNum = dividePointEndNum[kCounter] - dividePointStartNum[kCounter];
			}
			//Debug.
			for ( var kCounter = 0; kCounter < dividePointStartNum.length; kCounter++ ) {
				console.log("切り抜く頂点の数は%d～%dなので、%d個", dividePointStartNum[kCounter], dividePointEndNum[kCounter], DividePointsNum);
			}

			//切り抜くポイントは、dividePointStartNum～dividePointEndNumの間.
			if ( CrossPoints.length > 1 ) {
				let newShape = new Array();
				newShape.push( createVector( CrossPoints[0].x, CrossPoints[0].y, 0 ) );//まず交点
				console.log("CrossPoints.length="+CrossPoints.length);
				for ( var kCounter = dividePointStartNum[0] + 1; kCounter < dividePointStartNum[1]+1; kCounter++ ) {
					newShape.push( createVector( zukei[jCounter].pvec[0][kCounter].x  , zukei[jCounter].pvec[0][kCounter].y, 0 ) ) ;
				}
				newShape.push( createVector( CrossPoints[1].x, CrossPoints[1].y, 0 ) );
				console.log("newShape="+newShape);
				//これで図形の追加ができた.
				zukei.push( new Zukei( zukei.length, 0, 0, newShape ) );
				//追加した分の頂点をもとの図形から削除する.
				zukei[jCounter].pvec[0].splice( dividePointStartNum[0]+1, dividePointStartNum[1]-dividePointStartNum[0] );
				zukei[jCounter].pvec[0].splice( dividePointStartNum[0]+1, 0, CrossPoints[0], CrossPoints[1]);
				if ( zukei[jCounter].pvec[0][dividePointStartNum[0]+1].length < 3 ||
					zukei[jCounter].getArea() < 10
				) { //図形を作れないので、削除
					zukei.splice( jCounter, 1 );
				}
			}
            CrossPoints = [];//配列をクリアする.
			CrossPointsLocation = [];	//配列をクリアする.
			dividePointStartNum = [];
			dividePointEndNum = [];
        }

		//全部終わったらベクトルを0に戻して、カットモードもoffにする.
		vShiten.x = vShiten.y = vSyuten.x = vSyuten.y = iShitenSyuten = 0;
		isCutMode = !isCutMode;
	} else {
		console.log("？？");
	}
	iShitenSyuten++;

}
/**}}}*/

/** マウスやタッチパッドがドラッグされたら.
 * PCとスマホでは、マウスとタッチパッドが異なるため、
 * mouseX pmouseXとかが touchX ptouchXに変えないといけない。
 * それぞれのメソッドを準備すると、大変なので、
 * ここに送る前にmouseX等を取得しておき、ここに送るときに引数として処理する.
 * @param pinputX pmouseXか、ptouchXのどっちか.
 * @param pinputY pmouseYか、ptouchYのどっちか.
 * @param inputX mouseXか、touches[0].xのどっちか.
 * @param inputY mouseYか、touches[0].yのどっちか.
 */
function pressProcessCutModeOff( pinputX, pinputY, inputX, inputY ) { /** {{{*/
	//drawBackground();
	// 二つ以上の図形が重なっている場合にチェックしないといけないので、
	//とりあえず、内側にある図形を保存しておく.
	bIsInclude = new Array(zukei.length);

	//bIsInclude で重なっていてもonになるので、重複している図形の中で、
	//一番レイヤが一番前に来ているもの[iLayerが一番大きいもの]を[選択]にする.
	//ただしここでは、zukei.get(iCounter)で選ばれている配列番号であり、レイヤーではない.
	var iSelectedZukei = -1;
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {//初期化
		bIsInclude[iCounter] = false;
	}

	sortZukei();

	//内側にあるものをちぇっく
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		if ( zukei[iCounter].isInclude( inputX, inputY ) ) { //マウスクリックした時に、その図形が図形内なら[但し、重なっているときは別途処理が必要]
			bIsInclude[ iCounter ] = true;
		}
	}

	//内側にあるものの中で、一番iLayerが大きいものをチェック
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		if ( bIsInclude[iCounter] == true ) {
			if ( iSelectedZukei < zukei[iCounter].iLayer ) {
				iSelectedZukei = iCounter;
			}
		}
	}

	//iSelectedZukeiによってレイヤーが変わるはずなので、iSelectedNumを送って、
	//最も最上位のレイヤをチェンジする.
	if ( iSelectedZukei >= 0 ) {
		var iTmpLayerNum = zukei[iSelectedZukei].iLayer;
		fill( 128, 128, 128 );
		text("iTmpLayerNum=" + iTmpLayerNum, 100,100);
		fill(  0,  0, 255 );
		for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
			if ( iTmpLayerNum < zukei[iCounter].iLayer ) {
				zukei[iCounter].iLayer--;
			}
		}
		//選択された図形を最上位レイヤーに
		zukei[iSelectedZukei].iLayer = zukei.length - 1;
	}

	//選択された図形のみをisSelectedプロパティでtrueにする.それ以外はfalse
	for( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		if ( iCounter == iSelectedZukei ) {
			zukei[iCounter].isSelected = true;
		} else {
			zukei[iCounter].isSelected = false;
		}
	}

	sortZukei();
	/**下の命令はちらつき防止のために必要*/
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		zukei[iCounter].disp();
	}



}
/**}}}*/


/** マウスが押下されたイベント.touchStartedにも対応するために、そのまんまpressProcessに流す. */
function mousePressed() { /** {{{*/
	pressProcess( pmouseX, pmouseY, mouseX, mouseY );
}
/** }}}*/

/** タッチクリックされたイベント. 
 * mousePressedにも対応するために、そのまんまpressProcessに流しているが、
 * タッチモードでは、createButtonに対応していない.
 * そのため、タッチされた時の座標からボタンイベント判別している.*/
function touchStarted() { /** {{{*/
	//両脇の時のスワイプは無効にする.
	if ( touches[0].x > 16 && touches[0].x < window.innerWidth-16 ) {
		pressProcess( ptouchX, ptouchY, touches[0].x, touches[0].y );
	} else {
		e.preventDefault();
	}
	let touchXX, touchYY;//タッチされたtouches[0]の座標
	touchXX = touches[0].x;
	touchYY = touches[0].y;
	
	//カットモードに対応させる.
	if ( touchXX > 30 && touchXX < 30 + btnCut.width &&
		touchYY> 30 && touchYY < 30 + btnCut.height ) {
		//カットモードに移行する。
		cutter();
	} else if ( touchXX > 30+50+btnCut.width && touchXX < 30+50+btnCut.width+btnAdd.width &&
				touchYY > 30 && touchYY < 30 + btnAdd.height) { //図形追加モードに対応させる.
		//図形追加モードに移行する.
		adder();
	} else if ( touchXX > 30+50*2+btnCut.width + btnAdd.width && touchXX < 30+50*2+btnCut.width+btnAdd.width+btnHishigata.width &&
				touchYY > 30 && touchYY < 30 + btnHishigata.height) {
		//菱形学習モードに移行する.
		putHishigata();
	} else if ( touchXX > btnTriangle.x && touchXX < btnTriangle.x+btnTriangle.width && touchYY > btnTriangle.y && touchYY < btnTriangle.y + btnTriangle.height ) {
		//三角形学習モードに移行する.
		putTriangle();
	} else if ( touchXX > btnParallelogram.x && touchXX < btnParallelogram.x+btnParallelogram.width && touchYY > btnParallelogram.y && touchYY < btnParallelogram.y + btnParallelogram.height ) {
		//平行四辺形学習モードに移行する.
		putParallelogram();
	} else if ( touchXX > btnTrapezoid.x && touchXX < btnTrapezoid.x+btnTrapezoid.width && touchYY > btnTrapezoid.y && touchYY < btnTrapezoid.y + btnTrapezoid.height ) {
		//台形学習モードに移行する.
		putTrapezoid();
	} else if ( touchXX > btnNormalTriangle.x && touchXX < btnNormalTriangle.x+btnNormalTriangle.width && touchYY > btnNormalTriangle.y && touchYY < btnNormalTriangle.y + btnNormalTriangle.height ) {
		//普通の三角形学習モードに移行する.
		putNormalTriangle();
	} else if ( touchXX > btnPentagon.x && touchXX < btnPentagon.x+btnPentagon.width && touchYY > btnPentagon.y && touchYY < btnPentagon.y + btnPentagon.height) {
		//五角形学習モードに移行する.
		putPentagon();
	} else if ( touchXX > btnHexagon.x && touchXX < btnHexagon.x+btnHexagon.width && touchYY > btnHexagon.y && touchYY < btnHexagon.y + btnHexagon.height ) {
		//六角形学習モードに移行する.
		putHexagon();
	} else if ( touchXX > btnSeptagon.x && touchXX < btnSeptagon.x + btnSeptagon.width && touchYY > btnSeptagon.y && touchYY < btnSeptagon.y + btnSeptagon.height ) {
		//七角形学習モードに移行する.
		putSeptagon();
	} else if ( touchXX > 30 && touchXX < chkbox.width && touchYY > 30 + 20 + btnCut.height && touchYY < 30 + 20 + btnCut.height + chkbox.height) {
		//グリッド線を出力する.
		//チェックボックスの値を変更する.
		console.log("isPC = " + isPC);
		if ( isPC == false  ) {
			//PCでは、マウスの反応が効くので無視
			document.getElementsByTagName('input')[0].checked = !document.getElementsByTagName('input')[0].checked;
			chkboxevent();
			
		}
	}
}
/**}}}*/


/**1フレームごとに実行.processing,p5jsでは、ここがループしている.
 */
function draw(){ /** {{{*/
	/* マウスでもタッチでもどちらでも対応できるように、PCではマウス、タブレット、スマホではタッチ対応にさせる.*/
	let pinputX;	//前のX座標
	let pinputY;	//前のY座標
	let inputX;		//現在のX座標
	let inputY;		//現在のY座標
	if ( isPC == true ) {
		//マウスを検出するようにする.
		pinputX = pmouseX;
		pinputY = pmouseY;
		inputX  = mouseX;
		inputY  = mouseY;
	} else {
		//タブレットを検出するようにする.
		if ( touches.length != 0 ) {
			pinputX = ptouchX;
			pinputY = ptouchY;
			inputX  = touches[0].x;
			inputY  = touches[0].y;
		}
	}

	drawBackground();
	sortZukei();

	//頂点の数が３よりも小さい場合は図形を作れないので、そもそも削除する.
	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		//console.log("図形の頂点の数＝%d", zukei[iCounter].pvec[0].length);
		if ( zukei[iCounter].pvec[0].length < 3 ) {
			//図形が作れていない.
			//console.log("図形が作れていない.");
			zukei.splice(iCounter, 1);
		}
		if ( zukei[iCounter].getArea() < 20 ) {
			//console.log("面積が小さい." + zukei[iCounter].getArea());
			//zukei.splice(iCounter, 1);
		}
	}

	for ( var iCounter = 0; iCounter < zukei.length; iCounter++ ) {
		zukei[iCounter].disp();
	}

    /*カットモードの場合の線を表示*/
    if ( isCutMode == true && iShitenSyuten == 2 ) {
        push();
        stroke(221, 160, 221);
        fill(221,160,221);
        
        drawLine (vShiten.x, vShiten.y, mouseX, mouseY);
        dispCrossPoints(vShiten.x, vShiten.y, mouseX, mouseY);
        pop();
    }

	/* 図形追加モードの場合の線を表示 */
	if ( isAddMode == true && iVertexNum >= 1 ) {
		push();
		stroke(100, 149,237);
		fill(100, 149, 237);
		if ( iVertexNum == 2 ) {
			console.log("iVerTexnumは2");
			circle(mouseX, mouseY, 14);
		}
		let maxnum = newShape.length;
		for ( var iCounter = 1; iCounter < maxnum; iCounter++ ) {
			drawLine( newShape[iCounter-1].x, newShape[iCounter-1].y, newShape[iCounter].x, newShape[iCounter].y );
		}
		push();
		fill('rgba(100, 149, 237, 0.50)');	
		if ( maxnum >=2 ) { //候補も点線だけでなく、面までを作ってしまおう.
			beginShape();
			for ( var iCounter = 0; iCounter < maxnum; iCounter++ ) {
				vertex( newShape[iCounter].x, newShape[iCounter].y);
			}
			vertex(mouseX,mouseY);
			endShape(CLOSE);
		}
		pop();
		if ( maxnum > 0 ) {
			drawLine( newShape[maxnum-1].x, newShape[maxnum-1].y, mouseX, mouseY );
		}
		
		pop();
	}
	if ( isPC == false ) {
		if ( touches.length != 0 ) {
			ptouchX = touches[0].x;
			ptouchY = touches[0].y;
		}
	}
}
/** }}}*/

/**背景を描画する*/
function drawBackground() { /** {{{*/
	if ( isCutMode == true ) {
		background( 128, 128, 102 );
	} else if ( isAddMode == true ) {
		background( 135, 206, 250 );
	} else {
		background( 255, 255, 204 );
	}
	for ( var iCounter = 0; iCounter < iHeight; iCounter+=20 ) {
		for ( var jCounter = 0; jCounter < iWidth; jCounter += 20 ) {
			point( jCounter, iCounter );
		}
	}

	if ( isGridChecked == true) {//グリッド線を出力する.
		//if ( isPC == false  ) {
			//PCでは、マウスの反応が効くので無視
			document.getElementsByTagName('input')[0].checked = true;
		//}
		push();
		fill(65, 105, 255);
		//台形モードだけ、ｘ軸方向のグリッド線が１ブロックはみ出るので、線を追加.
		let plus;
		plus = 0;
		if ( isTrapezoidMode == true ) {
			plus = 80;
		}
		for ( var xxx= 80; xxx <= 720+ plus; xxx+=80){
			line( xxx, 200, xxx, 520); 
		}
		for (var yyy=200; yyy<=520; yyy+=80){
			line( 80, yyy, 720+plus, yyy );
		}
		pop();
	}

}
/**}}}*/


/** カットモードの際、交点を出力する. forで回す際、最後のポイントから０番目のポイントがややこしいので.
 * @param iMode   DISP_MODE カットモードの候補●を表示する. @type{Number}
 * @param jCounter 何番目のzukeiか.							@type{Number}
 * @param iStart　図形の任意のポイント						@type{Number}
 * @param iEnd    図形の任意のポイント＋１番目の座標が多いが、最後～０の場合は別途指定する. @type{Number}
 * @param x2 始点のｘ座標									@type{Number}
 * @param y2 始点のy座標									@type{Number}
 * @param x3 終点の候補位置 mouseX							@type{Number}
 * @param y3 終点の候補位置 mouseY							@type{Number}
 * @link https://www.youtube.com/watch?v=DXajm0sHfp0
 */
function calcVectorEquation(iMode, jCounter, iStart, iEnd, x2, y2, x3, y3 ){ /** {{{*/
    x0 = zukei[jCounter].pvec[0][iStart].x;
    y0 = zukei[jCounter].pvec[0][iStart].y;
    x1 = zukei[jCounter].pvec[0][iEnd].x;
    y1 = zukei[jCounter].pvec[0][iEnd].y;
    //y軸並行となってしまうのを回避
    if ( abs(x1-x0) < 0.01 ) x1 = x0 + 0.01;
    if ( abs(x3-x2) < 0.01 ) x3 = x3 + 0.01;
    //まず傾きを求めておく.
    t0 = (y1-y0)/(x1-x0);
    t1 = (y3-y2)/(x3-x2);
    
    if (t0 !== t1) {
        crossX = ( y2 - y0 + t0*x0 - t1*x2) / (t0-t1);
        crossY = t0*(crossX-x0) + y0;
    }
    let r0 = ( crossX-x0) / (x1-x0);
    let r1 = ( crossX-x2) / (x3-x2);
    let hit = 0<r0 && r0<1 && 0<r1 && r1<1;
    if (t0 !== t1 && hit) {
        if (iMode == DISP_MODE) {               //まだ終点を選んでいないので、交点の候補を●で出力する.
            push();
            strokeWeight(24);
            point(crossX, crossY);
            pop();
        } else if ( iMode == DIVIDE_MODE ) {    //終点を選択し終えたので、分割するための情報を入れておく.
            if ( !CrossZukeiNum.includes(jCounter)) {
                CrossZukeiNum.push(jCounter);
            }
            CrossPoints.push(createVector( crossX, crossY, 0 ));
			CrossPointsLocation.push(iStart);
        }
    }
}
/**}}}*/


/** カットモードの際、交点を出力する
 * @param x2 始点のｘ座標								@type{Number}
 * @param y2 始点のy座標								@type{Number}
 * @param x3 終点の候補位置 mouseX						@type{Number}
 * @param y3 終点の候補位置 mouseY						@type{Number}
 * @link https://www.youtube.com/watch?v=DXajm0sHfp0	
 */
function dispCrossPoints( x2, y2, x3, y3) { /** {{{*/
    let t0, t1; //傾き
    let x0, y0, x1, y1;//線分の座標
    
    //とりあえず、zukei[0]のみを考える.
    //線分pvec[0]～pvec[length-1]まで.
    //console.log("pvec.length=" + zukei[0].pvec[0].length);
	let nowZukeiLength = zukei.length;	//途中で分割する可能性があるため、zukei.lengtが変わってくるかも知れないので。
	let retCrossPoints = [];
    for ( let jCounter = 0; jCounter < nowZukeiLength; jCounter++) {
		//交点情報をクリア
		CrossPoints = [];
        for ( let iCounter = 0; iCounter < zukei[jCounter].pvec[0].length -1; iCounter++) {
            calcVectorEquation(DISP_MODE, jCounter, iCounter, iCounter+1,x2, y2, x3, y3);
        }
        calcVectorEquation(DISP_MODE, jCounter, zukei[jCounter].pvec[0].length-1, 0, x2,y2,x3,y3);
    }
    
    //最後に線分[pvec[length-1]～pvec[0]]を計算する.
    //console.log("crossX = " + crossX);
}
/**}}}*/

/** 点線を表示する.
 * @param x1 始点のｘ座標			@type{Number}
 * @param y1 始点のy座標			@type{Number}
 * @param x2 終点の候補位置 mouseX	@type{Number}
 * @param y2 終点の候補位置 mouseY	@type{Number}
 */
function drawLine(x1, y1, x2, y2) { /** {{{*/
    let space = 10;
    const d = dist(x1, y1, x2, y2);
    const n = ceil(d / space);
  
    let v = createVector(x2 - x1, y2 - y1);
    v.setMag(space);
  
    let x = x1;
    let y = y1;
  
    for (let i = 0; i < n; i++) {
      x += v.x;
      y += v.y;
      circle(x, y, 5);
    }
    circle(x1, y1, 14);
    circle(x2, y2, 14);
}
/**}}}*/

/** 図形を扱うクラス. zukei=Array()に、インスタンスを配列化して管理する.
 * 図形の形そのものは、どこにいても変わらないので、基点を元にして、ベクトル*/
class Zukei { /** {{{*/
	/** コンストラクタ.プロパティはここで宣言する.
	 * @constructor
	 * @param {Number} ilayer レイヤ番号		
	 * @param {Number} ibasex 基点の座標
	 * @param {pVector} v     (PVector)
	 */
	constructor( ilayer, ibasex, ibasey, v ) { /** {{{*/
		/** レイヤ */
		this.iLayer = ilayer;
		/** 基点の座標 */
		this.iBaseX = ibasex;
		this.iBaseY = ibasey;
		/** 選択されているかどうか */
		this.isSelected = false;
		
		/** 頂点のデータの埋め込み. */
		this.pvec = new Array( v );
		/** pvecの中心点 */
		this.pvecCentral;

		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			this.pvec[0][iCounter].x += this.iBaseX;
			this.pvec[0][iCounter].y += this.iBaseY;
		}
		
		this.setCentralPoint();

	}
	/**}}}*/

	/** 面積を求めて返す.
	 * @see https://gist.github.com/pistatium/46529d31cfa3c5281ba3
	 * */
	getArea() { /** {{{*/
		let sum = 0.0;
		let i;
		let i_next;
		let i_next2;
		for ( let i = 0; i < this.pvec[0].length; i++ ) {
			i_next = ( i + 1 ) % this.pvec[0].length;
			i_next2 = ( i + 2 ) % this.pvec[0].length;

			sum += ( this.pvec[0][i].x - this.pvec[0][i_next2].x ) * this.pvec[0][i_next].y;
			sum = Math.abs(0.5*sum);
		}
		return sum;
	}
	/** }}}*/

	/** マウスで選択した座標が、自分の図形に内包しているか.
   	 * @param mx マウスのx座標		@type{Number}
     * @param my マウスのy座標		@type{Number}
     * @return true:内包している. false:内包していない @type{boolean}
     */
	isInclude( mx, my ) { /** {{{*/
		let bRet;
		//多角形とマウス間の角度を求める.
		let fAngle = new Array(this.pvec[0].length );
		//角度の合計値
		let fSumAngle = 0;
		
		var iAt; //そのままiCounterにしてしまったら、最後の要素と、0の要素ベクトル比較ができない.
		var va,vb;

	

		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			if ( iCounter + 1 >= this.pvec[0].length ) {
				iAt = 0;
			} else {
				iAt = iCounter + 1;
			}
			va = createVector( this.pvec[0][iCounter].x - mx, this.pvec[0][iCounter].y - my );
			vb = createVector( this.pvec[0][iAt].x - mx, this.pvec[0][iAt].y - my );
			
			fAngle[iCounter] = va.angleBetween( vb );
			
			/*if ( va.cross( vb ).z < 0 ) {
				fAngle[iCounter] *= -1;
			}
			*/
		}

		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			fSumAngle += fAngle[iCounter];
		}

		fSumAngle = abs( round( degrees( fSumAngle ) ) );

		if( fSumAngle > 0 ) {
			bRet = true;
		} else {
			bRet = false;
		}
		return bRet;
	}
	/**}}}*/

	/** 図形を移動させるために、それぞれの座標を変更する
	 * @param xOffset xの移動量		@type{Number}
	 * @param yOffset yの移動量		@type{Number}
	 */
	moveOffset( xOffset, yOffset ) { /** {{{*/
		for( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			this.pvec[0][iCounter].x -= xOffset;
			this.pvec[0][iCounter].y -= yOffset;
		}
		this.setCentralPoint();
		return;
	}
	/**}}}*/

	/** 図形を回転させるために、それぞれの座標を変更する.
	 * 本当は、pushMatrix, translate & rotate popMatrixしたかったが、
	 * そんな命令に気づくのが遅かった.
	 * @param pinputX pmouseXか、ptouchXのどっちか.
 	 * @param pinputY pmouseYか、ptouchYのどっちか.
 	 * @param inputX mouseXか、touches[0].xのどっちか.
 	 * @param inputY mouseYか、touches[0].yのどっちか.
	 */
	rotateOffset( pinputX, pinputY, inputX, inputY ) { /**{{{*/
		var x,y; //旧座標
		var newX, newY; //回転後の新座標

		//多角形とマウス間の角度を求める。
		var fAngle;
		var va = createVector( inputX - this.pvecCentral.x, inputY - this.pvecCentral.y );
		var vb = createVector( pinputX - this.pvecCentral.x, pinputY - this.pvecCentral.y );

		//マウスの移動量に対する角度
		fAngle = va.angleBetween( vb );
		//console.log("fAngle = " +degrees( fAngle ) );
		/*if ( va.cross( vb ).z > 0 ) {//javascriptでは、なぜか外積計算をしなくても方向がわかっているので不要
			fAngle *= -1;
		}
		*/
	
		//座標変換する
    	var Cx = this.pvecCentral.x, Cy = this.pvecCentral.y;
		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			x = this.pvec[0][iCounter].x;
			y = this.pvec[0][iCounter].y;
			newX = x * cos(-fAngle) - y * sin(-fAngle) + Cx - Cx * cos(-fAngle) + Cy * sin(-fAngle);;
			newY = x * sin(-fAngle) + y * cos(-fAngle) + Cy - Cx * sin(-fAngle) - Cy * cos(-fAngle);
			this.pvec[0][iCounter].x = newX;
			this.pvec[0][iCounter].y = newY;
		}

		return;
	}
	/**}}}*/

	/** 頂点データから中心点を求める.
     * 回転のために使うので、重心ではなく、各頂点のうち、最も小さいxと、最も大きいx,
     * 最も小さいｙと、最も大きいyの平均の場所にする.
    */
	setCentralPoint() { /** {{{*/
		var MinX = iWidth, MaxX = 0;
		var MinY = iHeight, MaxY = 0;
		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			if ( MinX > this.pvec[0][iCounter].x ) {
				MinX = this.pvec[0][iCounter].x;
			}
			if ( MaxX < this.pvec[0][iCounter].x ) {
				MaxX = this.pvec[0][iCounter].x; 
			} 
			if ( MinY > this.pvec[0][iCounter].y ) {
				MinY = this.pvec[0][iCounter].y; 
			}
			if ( MaxY < this.pvec[0][iCounter].y ) {
				MaxY = this.pvec[0][iCounter].y; 
			}
		}
		this.pvecCentral =  createVector( (MinX+MaxX)/2,(MinY+MaxY)/2 );
	}
	/**}}}*/

	 /** 図形を描画する. */
	disp() { /** {{{*/
		beginShape();
		for ( var iCounter = 0; iCounter < this.pvec[0].length; iCounter++ ) {
			let x = this.pvec[0][iCounter].x;
			let y = this.pvec[0][iCounter].y;
			vertex( this.pvec[0][iCounter].x, this.pvec[0][iCounter].y );
			
		}
		endShape(CLOSE);
		fill( 128, 128, 128 );
		textSize(32);
		//text( this.iLayer, this.pvecCentral.x, this.pvecCentral.y );
		//fill(  255,  192, 203 );
		fill('rgba(255, 192, 203, 0.90)');	

		for ( var iCounter = 0; iCounter < this.pvec[0].length;iCounter++ ) {
			let x = this.pvec[0][iCounter].x;
			let y = this.pvec[0][iCounter].y;
			push();
				textSize(26);
				fill(255,0,255);
				//text( iCounter, this.pvec[0][iCounter].x, this.pvec[0][iCounter].y);
			pop();
		}



	}
	/**}}}*/
}
/**}}}*/
