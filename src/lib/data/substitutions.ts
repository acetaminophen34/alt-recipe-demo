import type { SubstitutionEntry } from "../types";

/**
 * 代替知識ベース（ローカルエンジン用）。
 *
 * 一般的な家庭料理の材料・器具について、「何で代用できるか」「分量の目安」
 * 「手順がどう変わるか」をキュレーションしたデータ。
 * ここにある項目はAPIキーなし・通信なしで即座に代替案を返せる。
 *
 * - key: レシピ側の key（または手順文中の表記）と一致させる正規名
 * - aliases: 表記ゆれ・別名・英語名（TheMealDB 由来レシピ向け）
 * - stepWord: 手順文中に出てくる key を置き換える語
 */
export const substitutionKnowledgeBase: SubstitutionEntry[] = [
  // ================= 材料（和・洋の基本） =================
  {
    key: "牛乳",
    aliases: ["ミルク", "milk", "whole milk"],
    kind: "ingredient",
    replacement: "豆乳（同量）",
    detail: "無調整豆乳を同量。なければ水＋ヨーグルト（水7：ヨーグルト3）でも可。",
    stepNote: "豆乳は沸騰させると分離しやすいので、加熱は弱火で短時間に。",
    stepWord: "豆乳",
  },
  {
    key: "生クリーム",
    aliases: ["ホイップクリーム", "heavy cream", "double cream", "whipping cream"],
    kind: "ingredient",
    replacement: "牛乳＋バター",
    detail: "牛乳200mlに溶かしバター大さじ2を混ぜる。泡立て用途なら代用不可なので、とろみ付け・仕上げ用途に限る。",
    stepNote: "泡立てはできないため、ホイップする手順は「混ぜ込む」に変更する。",
    stepWord: "牛乳とバターを混ぜたもの",
  },
  {
    key: "バター",
    aliases: ["無塩バター", "有塩バター", "butter"],
    kind: "ingredient",
    replacement: "サラダ油またはオリーブオイル（8割量）",
    detail: "炒め・焼き用途なら油で代用可。お菓子の練り込み用途ではマーガリンが近い。風味は軽くなる。",
    stepNote: "油はバターより広がりやすいので、焼き菓子は生地が緩くなりやすい。",
    stepWord: "サラダ油",
  },
  {
    key: "卵",
    aliases: ["全卵", "egg", "eggs"],
    kind: "ingredient",
    replacement: "卵1個＝豆腐（絹）大さじ3、または片栗粉大さじ1＋水大さじ2",
    detail: "つなぎ用途の代用。オムレツなど卵が主役の料理には向かない。",
    stepNote: "膨らみや固まり方が弱くなるため、加熱は長めに・崩しすぎない。",
    stepWord: "溶いた豆腐",
  },
  {
    key: "卵黄",
    aliases: ["egg yolk", "egg yolks"],
    kind: "ingredient",
    replacement: "全卵（卵黄1個分＝全卵1/2個目安）",
    detail: "コクはやや落ちるが成立する。色を濃くしたい場合はかぼちゃペースト少量でも可。",
    stepNote: "水分が増えるので、クリーム系は加熱を少し長めにしてとろみを出す。",
    stepWord: "溶き卵",
  },
  {
    key: "卵白",
    aliases: ["egg white", "egg whites"],
    kind: "ingredient",
    replacement: "泡立てた生クリーム（同量）",
    detail: "メレンゲの代用にはならないが、軽さとコクの追加には使える。マカロン等の本格菓子には不向き。",
    stepNote: "メレンゲの泡立て手順は省略し、最後に生クリームをさっくり混ぜる。",
    stepWord: "泡立てた生クリーム",
  },
  {
    key: "小麦粉",
    aliases: ["薄力粉", "flour", "plain flour", "all-purpose flour"],
    kind: "ingredient",
    replacement: "米粉（同量）または片栗粉（とろみ用途）",
    detail: "米粉はグルテンがないため膨らみ方が変わる。揚げ物の衣なら片栗粉・コーンスターチが近い。",
    stepNote: "米粉生地は混ぜすぎても粘りが出ない分、扱いやすいが乾燥しやすい。",
    stepWord: "米粉",
  },
  {
    key: "強力粉",
    aliases: ["bread flour", "strong flour"],
    kind: "ingredient",
    replacement: "薄力粉＋片栗粉（9:1）",
    detail: "完全な代用ではないがパンは焼ける。膨らみと弾力は弱くなる。",
    stepNote: "こね時間を少し長く取り、発酵は控えめにすると形が保ちやすい。",
    stepWord: "薄力粉",
  },
  {
    key: "ベーキングパウダー",
    aliases: ["baking powder"],
    kind: "ingredient",
    replacement: "重曹 小さじ1/2＋酸性の液体（レモン汁やヨーグルト）少量",
    detail: "重曹だけだと苦味が出ることがある。膨らみは弱めになる。",
    stepNote: "ガスが発生し始めたら時間を置かず、すぐに焼き始める。",
    stepWord: "重曹",
  },
  {
    key: "砂糖",
    aliases: ["グラニュー糖", "上白糖", "sugar", "caster sugar", "granulated sugar"],
    kind: "ingredient",
    replacement: "はちみつ（7〜8割量）または三温糖・きび砂糖（同量）",
    detail: "はちみつは甘みが強いので減らす。カラメル用途はグラニュー糖系の代用が安全。",
    stepNote: "はちみつは焦げやすいので、加熱の色づきを早めに確認する。",
    stepWord: "はちみつ",
  },
  {
    key: "粉砂糖",
    aliases: ["powdered sugar", "icing sugar", "confectioners sugar"],
    kind: "ingredient",
    replacement: "グラニュー糖をミキサーで粉砕したもの（同量）",
    detail: "仕上げのふりかけ用途なら片栗粉少量でも見た目を再現できる（甘さは付かない）。",
    stepNote: "溶けやすさが違うため、マカロン等では生地が緩くなる場合がある。",
    stepWord: "粉砕したグラニュー糖",
  },
  {
    key: "はちみつ",
    aliases: ["honey"],
    kind: "ingredient",
    replacement: "砂糖＋水（砂糖大さじ1＋水小さじ1で大さじ1分）",
    detail: "メープルシロップでも可。照りは砂糖でも出せる。",
    stepNote: "はちみつ特有の風味はなくなるが、甘さと照りは保てる。",
    stepWord: "砂糖水",
  },
  {
    key: "マスカルポーネ",
    aliases: ["マスカルポーネチーズ", "mascarpone"],
    kind: "ingredient",
    replacement: "クリームチーズ＋生クリーム",
    detail: "マスカルポーネ200g分＝クリームチーズ100g＋生クリーム100mlを滑らかになるまで混ぜる。",
    stepNote: "酸味が少し増えるので、砂糖をひとつまみ足すとバランスが取れる。",
    stepWord: "クリームチーズと生クリームを混ぜたもの",
  },
  {
    key: "クリームチーズ",
    aliases: ["cream cheese"],
    kind: "ingredient",
    replacement: "水切りヨーグルト＋生クリーム少量",
    detail: "ヨーグルト400gを一晩水切りすると約200g分。さっぱりした仕上がりになる。",
    stepNote: "水分が出やすいので、使う直前に水切りし直すとよい。",
    stepWord: "水切りヨーグルト",
  },
  {
    key: "エスプレッソ",
    aliases: ["espresso"],
    kind: "ingredient",
    replacement: "インスタントコーヒー＋お湯",
    detail: "エスプレッソ100ml分＝インスタントコーヒー小さじ2＋お湯100ml。濃いめに淹れたドリップでも可。",
    stepNote: "風味は穏やかになる。染み込ませ用途では温度を少し下げると生地が崩れにくい。",
    stepWord: "濃いめのコーヒー",
  },
  {
    key: "ココアパウダー",
    aliases: ["純ココア", "cocoa powder", "ココア"],
    kind: "ingredient",
    replacement: "ミルクココア（砂糖を少し減らして使用）",
    detail: "調整ココアは砂糖入りなので、レシピの砂糖を大さじ1程度減らす。",
    stepNote: "色と風味は薄くなる。仕上げ用なら量を多めにふる。",
    stepWord: "ミルクココア",
  },
  {
    key: "バニラビーンズ",
    aliases: ["バニラ", "vanilla"],
    kind: "ingredient",
    replacement: "バニラエッセンス 数滴",
    detail: "香り付けのみの代用。バニラオイルでも可。",
    stepNote: "エッセンスは加熱で香りが飛びやすいので、仕上げ近くで加える。",
    stepWord: "バニラエッセンス",
  },
  {
    key: "バニラエッセンス",
    aliases: ["vanilla extract", "vanilla essence"],
    kind: "ingredient",
    replacement: "ラム酒またはブランデー 小さじ1/2",
    detail: "香りの系統は変わるが、卵臭さを消す目的は果たせる。省略しても成立する。",
    stepNote: "アルコールは加熱で飛ぶため、風味づけは控えめになる。",
    stepWord: "ラム酒",
  },
  {
    key: "アーモンドプードル",
    aliases: ["皮無アーモンドプードル", "almond flour", "ground almonds"],
    kind: "ingredient",
    replacement: "薄力粉（同量）＋アーモンドエッセンス数滴",
    detail: "風味と油分が減るため、仕上がりは軽くあっさりする。きな粉でも代用可。",
    stepNote: "粉の吸水が変わるので、生地が固い場合は牛乳を小さじ1ずつ足す。",
    stepWord: "薄力粉",
  },
  {
    key: "チョコチップ",
    aliases: ["chocolate chips"],
    kind: "ingredient",
    replacement: "板チョコを刻んだもの（同量）",
    detail: "ビター・ミルクは好みで。溶けやすいので粗めに刻むと形が残る。",
    stepNote: "板チョコは焼成で溶け広がりやすいので、生地を冷やしてから焼くとよい。",
    stepWord: "刻んだ板チョコ",
  },
  {
    key: "カステラ",
    aliases: [],
    kind: "ingredient",
    replacement: "スポンジケーキまたはフィンガービスケット（同量）",
    detail: "市販のスポンジ台やフィンガービスケットで代用。パウンドケーキの薄切りでも可。",
    stepNote: "吸水性が違うため、液体は様子を見ながら染み込ませる。",
    stepWord: "スポンジケーキ",
  },
  {
    key: "レモン果汁",
    aliases: ["レモン汁", "lemon juice"],
    kind: "ingredient",
    replacement: "酢（米酢）同量、またはクエン酸ひとつまみ＋水",
    detail: "香りは変わるが酸味の役割は果たせる。ポッカレモン等の市販果汁でも可。",
    stepNote: "酢は加熱で香りが和らぐため、仕上げ用途では少量ずつ調整する。",
    stepWord: "酢",
  },
  {
    key: "みりん",
    aliases: ["mirin"],
    kind: "ingredient",
    replacement: "酒＋砂糖（酒大さじ1＋砂糖小さじ1で大さじ1分）",
    detail: "みりん風調味料でも可。照りと甘みを補う組み合わせ。",
    stepNote: "砂糖が焦げやすいので、煮詰める工程は火加減に注意。",
    stepWord: "酒と砂糖",
  },
  {
    key: "酒",
    aliases: ["料理酒", "sake"],
    kind: "ingredient",
    replacement: "水（同量）＋砂糖ひとつまみ",
    detail: "臭み消しの効果は弱まる。白ワインがあればそちらが近い。",
    stepNote: "アルコールによる臭み消しがない分、下処理（塩もみ等）を丁寧に。",
    stepWord: "水",
  },
  {
    key: "だし汁",
    aliases: ["だし", "和風だし"],
    kind: "ingredient",
    replacement: "水＋顆粒だし（水300mlに小さじ1）",
    detail: "顆粒だしがない場合は水＋醤油ひとたらしでも最低限の旨みは出る。",
    stepNote: "顆粒だしは塩分を含むため、醤油は少し控えめに調整する。",
    stepWord: "水で溶いた顆粒だし",
  },
  {
    key: "醤油",
    aliases: ["しょうゆ", "soy sauce"],
    kind: "ingredient",
    replacement: "塩＋だし（塩小さじ1/3＋だし大さじ1で大さじ1分の塩味目安）",
    detail: "色と香りは再現できないが塩味は補える。ナンプラーでも近い塩味になる。",
    stepNote: "色が付かないため、煮物は見た目が薄くなる。味見で塩加減を調整。",
    stepWord: "塩だし",
  },
  {
    key: "片栗粉",
    aliases: ["potato starch", "cornstarch", "corn starch"],
    kind: "ingredient",
    replacement: "コーンスターチまたは小麦粉（同量）",
    detail: "とろみ付けは同量で置き換え可。小麦粉は白濁するので汁物には不向き。",
    stepNote: "小麦粉は火を通し切らないと粉っぽさが残るため、加熱を長めに。",
    stepWord: "コーンスターチ",
  },
  {
    key: "サラダ油",
    aliases: ["油", "vegetable oil", "cooking oil"],
    kind: "ingredient",
    replacement: "オリーブオイル・ごま油など手持ちの食用油（同量）",
    detail: "風味の方向性は変わる。揚げ物には香りの弱い油が向く。",
    stepNote: "ごま油は香りが強いので、加熱しすぎると風味が飛ぶ。",
    stepWord: "オリーブオイル",
  },
  {
    key: "オリーブオイル",
    aliases: ["olive oil"],
    kind: "ingredient",
    replacement: "サラダ油（同量）",
    detail: "香りはなくなるが加熱調理は問題なし。仕上げの風味付けには不向き。",
    stepNote: "仕上げに香りが欲しい場合は、ごま油を数滴垂らすと雰囲気が変わる。",
    stepWord: "サラダ油",
  },
  {
    key: "鶏もも肉",
    aliases: ["鶏肉", "chicken", "chicken thigh"],
    kind: "ingredient",
    replacement: "鶏むね肉（同量）または豚こま切れ肉",
    detail: "むね肉は片栗粉をまぶすとしっとりする。加熱しすぎに注意。",
    stepNote: "むね肉は火が通りやすいので、煮る時間は1〜2分短くする。",
    stepWord: "鶏むね肉",
  },
  {
    key: "牛こま切れ肉",
    aliases: ["牛肉", "beef"],
    kind: "ingredient",
    replacement: "豚こま切れ肉または豚バラ（同量）",
    detail: "肉じゃが等は豚肉版も定番。脂の量で仕上がりのコクが変わる。",
    stepNote: "豚肉はアクが出やすいので、煮立ったら丁寧に取る。",
    stepWord: "豚こま切れ肉",
  },
  {
    key: "ベーコン",
    aliases: ["bacon"],
    kind: "ingredient",
    replacement: "ハムまたはソーセージ（同量）",
    detail: "塩味と旨みは近い。パン生地に巻く用途ではソーセージが扱いやすい。",
    stepNote: "ハムは水分が多いので、巻く前にキッチンペーパーで拭く。",
    stepWord: "ハム",
  },
  {
    key: "ドライイースト",
    aliases: ["インスタントドライイースト", "イースト", "yeast", "dried yeast"],
    kind: "ingredient",
    replacement: "ベーキングパウダー（小さじ2目安）※発酵なし即焼き",
    detail: "膨らみ方は変わり、パンの風味は出ない。スコーン風の焼き上がりになる。",
    stepNote: "発酵工程は省略し、成形したらすぐに焼く。",
    stepWord: "ベーキングパウダー",
  },
  {
    key: "クロテッドクリーム",
    aliases: ["clotted cream"],
    kind: "ingredient",
    replacement: "マスカルポーネ、または生クリームを固めに泡立てたもの",
    detail: "塗る用途なら水切りヨーグルト＋はちみつでも雰囲気は出る。",
    stepNote: "代用品は溶けやすいので、温かいうちに添えて早めに食べる。",
    stepWord: "マスカルポーネ",
  },
  {
    key: "食用色素",
    aliases: ["food colouring", "food coloring"],
    kind: "ingredient",
    replacement: "抹茶・ココア・紫いもパウダーなど天然素材（小さじ1/2〜）",
    detail: "色味は穏やかになる。省略しても味には影響しない。",
    stepNote: "粉末を足す分、生地が固くなる場合は液体を数滴足す。",
    stepWord: "抹茶パウダー",
  },
  {
    key: "三つ葉",
    aliases: [],
    kind: "ingredient",
    replacement: "青ねぎの小口切り、または省略",
    detail: "彩りと香りの担当なので、刻み海苔でも代わりになる。",
    stepNote: "加熱せず仕上げに散らす点は同じ。",
    stepWord: "青ねぎ",
  },
  {
    key: "しらたき",
    aliases: [],
    kind: "ingredient",
    replacement: "糸こんにゃく（同量）、または省略",
    detail: "糸こんにゃくはほぼ同じ使い方ができる。下ゆでは同様に必要。",
    stepNote: "省略する場合は煮汁が余るので、煮時間を少し延ばして調整。",
    stepWord: "糸こんにゃく",
  },
  // ================= 器具 =================
  {
    key: "ハンドミキサー",
    aliases: ["hand mixer", "electric whisk"],
    kind: "tool",
    replacement: "泡立て器（手作業）",
    detail: "泡立て時間は約2倍が目安。ボウルを氷水で冷やすと泡立ちが安定する。",
    stepNote: "泡立ては腕が疲れる前に材料をよく冷やし、大きなボウルで大きく混ぜると効率がよい。",
    stepWord: "泡立て器",
  },
  {
    key: "泡立て器",
    aliases: ["ホイッパー", "whisk"],
    kind: "tool",
    replacement: "フォーク2本、または清潔なペットボトルに材料を入れて振る",
    detail: "混ぜる用途ならフォークで十分。泡立て用途は時間がかかる。",
    stepNote: "泡立ては液量の多いボウルで、底から大きく動かす。",
    stepWord: "フォーク",
  },
  {
    key: "エスプレッソマシン",
    aliases: ["コーヒーメーカー"],
    kind: "tool",
    replacement: "インスタントコーヒーを少量のお湯で溶く",
    detail: "エスプレッソマシンがなくても濃いコーヒー液は作れる。マキネッタでも可。",
    stepNote: "粉が残らないよう、溶かした後に茶こしで漉すと滑らかになる。",
    stepWord: "インスタントコーヒー",
  },
  {
    key: "バーナー",
    aliases: ["ガスバーナー", "blowtorch", "kitchen torch"],
    kind: "tool",
    replacement: "オーブンのグリル（最上段で2〜3分）または熱したスプーンの背",
    detail: "クレームブリュレの表面焼きはグリルで代替可。見張りながら焼き色を付ける。",
    stepNote: "グリルは一気に焦げるので、扉を開けたまま目を離さない。",
    stepWord: "グリル",
  },
  {
    key: "絞り袋",
    aliases: ["piping bag"],
    kind: "tool",
    replacement: "ジッパー付き保存袋の角を切ったもの",
    detail: "口金がない場合は切り口の大きさで太さを調整。使い捨てで衛生的。",
    stepNote: "袋が破れやすいので、生地は入れすぎず空気を抜いてから絞る。",
    stepWord: "保存袋",
  },
  {
    key: "ふるい",
    aliases: ["粉ふるい", "sieve", "こし器"],
    kind: "tool",
    replacement: "茶こし、またはザル＋スプーン",
    detail: "粉類は茶こしで少しずつ。漉す用途は目の細かいザルで代用可。",
    stepNote: "少量ずつ入れ、スプーンの背で軽く押すとダマが残りにくい。",
    stepWord: "茶こし",
  },
  {
    key: "こし器",
    aliases: ["strainer"],
    kind: "tool",
    replacement: "茶こし＋ボウル、または清潔なキッチンペーパーで漉す",
    detail: "滑らかさはやや劣るが成立する。",
    stepNote: "熱い液体は少し冷ましてから漉すと安全。",
    stepWord: "茶こし",
  },
  {
    key: "オーブン",
    aliases: ["oven"],
    kind: "tool",
    replacement: "オーブントースター（温度と時間を調整）または魚焼きグリル",
    detail: "トースターは焦げやすいのでアルミホイルをかぶせ、時間は8割から様子見。",
    stepNote: "庫内が狭く熱源に近いため、焼き色が付いたらホイルで覆う。",
    stepWord: "オーブントースター",
  },
  {
    key: "ゴムベラ",
    aliases: ["ヘラ", "spatula"],
    kind: "tool",
    replacement: "木べら、または大きめのスプーン",
    detail: "混ぜる・こそげる用途は代用可。ボウルの隅のこそげはスプーンの方が得意な場面も。",
    stepNote: "生地の泡を潰さないよう、切るように混ぜる動きは同じ。",
    stepWord: "木べら",
  },
  {
    key: "めん棒",
    aliases: ["rolling pin"],
    kind: "tool",
    replacement: "ラップの芯、または500mlペットボトル（水を入れて重くする）",
    detail: "生地がくっつく場合は打ち粉かラップ越しに伸ばす。",
    stepNote: "均一な厚さにするため、生地を回しながら少しずつ伸ばす。",
    stepWord: "ラップの芯",
  },
  {
    key: "落し蓋",
    aliases: [],
    kind: "tool",
    replacement: "アルミホイルやクッキングシートに穴を開けたもの",
    detail: "鍋の内径より少し小さく切り、中央に穴を開ければ同じ効果。",
    stepNote: "軽いので具材が浮く場合は小皿を重しにする。",
    stepWord: "アルミホイルの落し蓋",
  },
  {
    key: "親子鍋",
    aliases: [],
    kind: "tool",
    replacement: "小さいフライパン（18cm前後）または片手鍋",
    detail: "1人分ずつ作る場合は小さめのフライパンが近い。丼への滑らせは菜箸で補助。",
    stepNote: "フライパンは熱の回りが早いので、卵を入れた後は弱火で加減する。",
    stepWord: "小さいフライパン",
  },
  {
    key: "温度計",
    aliases: ["thermometer"],
    kind: "tool",
    replacement: "見た目と時間で判断（シロップは水に落として丸められる硬さが目安）",
    detail: "118℃のイタリアンメレンゲ用シロップは、水に1滴落として指で丸められる「ソフトボール状」が目安。",
    stepNote: "煮詰めすぎると固くなるので、火から下ろすタイミングは早めに。",
    stepWord: "水での硬さ確認",
  },
  {
    key: "食パン型",
    aliases: ["パウンド型", "loaf pan", "loaf tin"],
    kind: "tool",
    replacement: "パウンド型、または牛乳パック＋クッキングシート（耐熱に注意）",
    detail: "金属型があればそれが最適。型に油を薄く塗ると外しやすい。",
    stepNote: "型の容積が違うと焼き時間が変わるので、焼き色と弾力で確認。",
    stepWord: "パウンド型",
  },
  {
    key: "ケーキクーラー",
    aliases: ["cooling rack"],
    kind: "tool",
    replacement: "焼き網、または菜箸を並べた上",
    detail: "底の蒸気を逃がすことが目的。網状のものなら何でも可。",
    stepNote: "直接皿に置くと底が湿るので、必ず隙間を作る。",
    stepWord: "焼き網",
  },
  {
    key: "電子レンジ",
    aliases: ["microwave"],
    kind: "tool",
    replacement: "湯煎（小鍋にお湯を張って温める）",
    detail: "牛乳やバターを温める用途は湯煎で代替可。時間は少し長めに。",
    stepNote: "沸騰させないよう、触って温かい程度で止める。",
    stepWord: "湯煎",
  },
];

/** key / alias を正規化して引くためのインデックス */
export function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s　]/g, "")
    .replace(/[（）()]/g, "")
    .replace(/（.+?用）/g, "")
    .trim();
}

const index = new Map<string, SubstitutionEntry>();
for (const entry of substitutionKnowledgeBase) {
  index.set(normalizeKey(entry.key), entry);
  for (const alias of entry.aliases ?? []) {
    const k = normalizeKey(alias);
    if (!index.has(k)) index.set(k, entry);
  }
}

/**
 * 材料・器具名から知識ベースを引く。
 * 完全一致 → 部分一致（key が名前に含まれる / 名前が key に含まれる）の順に探す。
 */
export function lookupSubstitution(
  name: string,
  kind?: "ingredient" | "tool",
): SubstitutionEntry | null {
  const normalized = normalizeKey(name);
  const exact = index.get(normalized);
  if (exact && (!kind || exact.kind === kind)) return exact;

  // 部分一致: レシピ側の名前が KB の key を含む（例: 「グラニュー糖（カラメル用）」→「グラニュー糖」）
  for (const entry of substitutionKnowledgeBase) {
    if (kind && entry.kind !== kind) continue;
    const candidates = [entry.key, ...(entry.aliases ?? [])];
    for (const c of candidates) {
      const cn = normalizeKey(c);
      if (cn.length >= 2 && normalized.includes(cn)) return entry;
    }
  }
  return null;
}
