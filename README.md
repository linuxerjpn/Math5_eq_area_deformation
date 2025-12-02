#小学校５年　図形の等積変形
小学校５年生の算数　図形の単元で、等積変形をブラウザ上で実現する.
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
