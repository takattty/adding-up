'use strict';
const fs = require('fs');
const readline = require('readline');//ファイルを１行づつ読み込むためのモジュール
const rs = fs.createReadStream('./popu-pref.csv');//読み取り専用。readstreamを作成。
const rl = readline.createInterface({ 'input': rs, 'output': {} });//引数にreadstreamが必要となるので予め上でその処理をしておく。そしてここでreadlineを作成。objectへ
const prefectureDataMap = new Map();

//どうやってliseStringにデータが入るかがわからない
rl.on('line', (lineString) => {//ここのlineイベントで引数にさっきの読み込んだデータが入るイメージでいいのかな？正直流れがイメージ出来てない。
  const columns =lineString.split(',');//lineStringに入ってくる文字列をカンマで区切る。配列ね。
  const year = parseInt(columns[0]);//全県の年度も取得済み
  const prefecture = columns[1];//全県のデータ取得済み
  const popu = parseInt(columns[3]);//全県の人口のデータも取得済み

  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);//県が決定
    if (!value) {//2010年の最初のif文では、下のvalueのフォーマットを予め作って置きたいので処理を作成している。
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {//ここと。
      value.popu10 = popu;
    }
    if (year === 2015) {//ここでその県の年度の判定をして、残りの人口を代入。二週目ではすでにvalueのデータフォーマットがあるので17行目の処理を飛ばしてここに来てデータを代入するだけ。
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});//2010と2015のデータを全て処理し終えると下の処理に移動。

rl.on('close', () => {
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  const rankingStrings = rankingArray.map(([key, value]) => {//map関数である条件を反映させた新しい配列を作成。
    return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
  });
  //console.log(Array.from(prefectureDataMap));//連想配列を普通の配列に戻す。この処理がまじで大事。
  console.log(rankingStrings);
});