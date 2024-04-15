import { Context, Schema } from 'koishi'

export const name = 'roulette'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})
export function apply(ctx: Context) {

  ctx.command('du <message>')
    .action((_, message) => {
      let stop = 0;
      //手铐
      let damage = 1;
      let state = 0;
      //进程进度

      let userid1 = ''
      let userid2 = ''
      let username1 = ''
      let username2 = ''
      //用户的name和账号
      let usernum = 0
      //计数
      const dispose1 = ctx.on('message', (session) => {
        const guildId = session.guildId;
        //存储群id，之后就只接受该群的信息
        if (session.content === '1' && state === 0 && session.guildId == guildId) {
          if (usernum == 0) {
            userid1 = session.userId
            username1 = session.username
            usernum++
            session.send(`${username1}签订了死神契约,开启了恶魔轮盘赌!但他还需要一个对手!\n【扣1加入这场豪赌!】`)
          }
          else if (usernum == 1 && session.userId != userid1 && session.guildId == guildId) {
            userid2 = session.userId
            username2 = session.username
            dispose1();
            state++;
            session.send(`${username2}签订了死神契约,加入了这局恶魔轮盘!\n【输入2开始游戏】`)
          }
        }//进入房间


        const dispose2 = ctx.on('message', (session) => {
          if (session.content === '2' && state == 1 && session.guildId == guildId) {
            const roomarr = new Array();
            for (let row = 0; row < 2; row++) {
              roomarr[row] = new Array();
              for (let col = 0; col < 3; col++) {
                roomarr[row][col] = 0;
              }
            }//房间数组,储存用户数据，id，生命值
            //例如roomarr[0][1]/roomarr[1][1]存储双方id,roomarr[0][0]/roomarr[1][0]存储双方名称,其实可以用对象来存储用户的信息和状态，这样代码写起来更顺畅
            roomarr[0][1] = userid1;
            roomarr[1][1] = userid2;
            roomarr[0][0] = username1;
            roomarr[1][0] = username2;


            let life = Math.floor(Math.random() * 6) + 2;
            roomarr[0][2] = life
            roomarr[1][2] = life
            //随机血量
            const bulletsarr = new Array();
            bullets(bulletsarr);
            //随机存入子弹，0储存子弹总数量，1储存真子弹数量，剩下的代表子弹
            props(roomarr, life);
            //随机存入道具
            const protest1 = new Array();
            const protest2 = new Array();
            propstext(roomarr, protest1, protest2)
            let test1 = protest1.reduce((acc, curr, index) => {
              if (typeof curr === 'string') {
                return acc + `${index + 1}. ${curr} `;
              }
              return acc;
            }, '');
            let test2 = protest2.reduce((acc, curr, index) => {
              if (typeof curr === 'string') {
                return acc + `${index + 1}. ${curr} `;
              }
              return acc;
            }, '');
            //提取字符串
            let user1 = Math.floor(Math.random() * 6) + 1;
            let user2 = Math.floor(Math.random() * 6) + 1;
            let ing = 0;
            if (user1 >= user2) {
              ing = 0
            }
            else ing = 1;
            let ingg = huan(ing)
            roomarr[ingg][2]++;
            dispose2();
            state = 3;
            session.send(`对局开始!\n【本轮子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][0]}掷出的骰子数字为${user1}点\n${roomarr[1][0]}掷出的骰子数字为${user2}点\n先手属于${roomarr[ing][0]}!\n${roomarr[ingg][0]}补偿一点生命值\n\n${roomarr[0][0]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][0]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,输入y向对方开火,输入n向自己开火,输入数字使用道具`)

            const dispose3 = ctx.on('message', (session) => {
              roomarr[0][1] = userid1;
              roomarr[1][1] = userid2;
              //bug补丁,或许删掉也能正常运行？因不明原因，当选择向自己开火并且空弹之后，程序无法继续运行，经排查，发现roomarr[0][1]roomarr[1][1]的值发生变化导致无法通过验证，未发现bug源头
              if (session.content == 'y' && state == 3 && session.userId == roomarr[ing][1] && session.guildId == guildId) {
                ingg = ing
                ing = huan(ing);
                //ingg是持枪者，ing更换为下一轮回合的持枪者
                bulletsarr[0]--;
                bulletsarr.pop()
                if (bulletsarr[0] == 0) {
                  bullets(bulletsarr);
                  //随机存入子弹，0储存子弹总数量，1储存真子弹数量，剩下的代表子弹
                  props(roomarr, life);
                  //随机存入道具
                  session.send(`子弹已经耗光!\n重新补充子弹\n本轮子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发\n新的道具已经发送给玩家\n`)
                }
                protest1.length = 0
                protest2.length = 0
                propstext(roomarr, protest1, protest2)
                let test1 = protest1.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                let test2 = protest2.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                //执行减少子弹，子弹数量检测并补充，刷新道具字符串，拼接道具字符串以便于显示给玩家
                if (bulletsarr[bulletsarr[0] + 1] % 2 == 1) {
                  bulletsarr[1]--;
                  //实弹数量变更
                  if (stop == 1) {
                    ing = huan(ing);
                    stop = 0
                  }//手铐道具实现所需代码,当手铐生效后,将已经更换的ing换回来
                  roomarr[ing][2] -= damage;
                  damage = 1;
                  //完成伤害计算，重置子弹伤害
                  if (roomarr[ingg][2] > 4) {
                    session.send(`【${roomarr[ingg][0]}眼神冰冷,紧紧握住手中的武器。指向${roomarr[ing][0]}的胸膛,他深吸一口气,食指缓缓扣动扳机,枪口发出一声沉闷的爆裂声。\n实弹!${roomarr[ing][0]}被一枪轰飞。狼狈不堪】\n【${roomarr[ing][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 4 && roomarr[ingg][2] > 2) {
                    session.send(`【${roomarr[ingg][0]}握紧手中的武器,冷汗顺着额角滑落。指向${roomarr[ing][0]}的胸膛,他深吸一口气,坚定地扣动了扳机,枪火喷射出无情的火舌\n实弹!${roomarr[ing][0]}被一枪轰飞。狼狈不堪】\n【${roomarr[ing][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 2) {
                    session.send(`【${roomarr[ingg][0]}已然汗流浃背,手臂不自觉地轻微抖动,呼吸变得越来越急促。仿佛用尽全身力气举起猎枪,指向${roomarr[ing][0]}的胸膛,猛的扣动扳机。\n实弹!${roomarr[ing][0]}被一枪轰飞。狼狈不堪】\n【${roomarr[ing][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ing][2] <= 0) {
                    ingg = huan(ing);
                    session.send(`${roomarr[ingg][0]}扣动胜利的扳机,${roomarr[ing][0]}再也不能站起,幽暗的密室内,突然挂起一阵狂风,裹挟着诡异的黑色气体构成了死神的虚影,挥起那诡异黑气构成的镰刀,${roomarr[ing][0]}的灵魂已经永远归属于死神,狂风散去,仿佛一切都没有发生。\n败者食尘!赢家通吃!${roomarr[ingg][0]}一脚踢开败者的残躯,拿走了对方当作赌注的财富\n胜利最终属于${roomarr[ingg][0]}!`)
                    dispose3();
                    state = 0;
                    session.send(`游戏已被关闭`)
                  }
                }
                else {
                  damage = 1;
                  //重置伤害值
                  if (stop == 1) {
                    ing = huan(ing);
                    stop = 0
                  }//手铐道具实现部分
                  if (roomarr[ingg][2] > 4) {
                    session.send(`【${roomarr[ingg][0]}眼神冰冷,紧紧握住手中的武器。他深吸一口气,食指缓缓扣动扳机,但出乎意料的是,响起的只有一声沉闷的"卡嗒"声,子弹并没有射出。】\n【空弹!什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 4 && roomarr[ingg][2] > 2) {
                    session.send(`【${roomarr[ingg][0]}握紧手中的武器,冷汗顺着额角滑落。他深吸一口气,坚定地扣动了扳机,但幸运女神没有降临,结果只能让他失望\n空弹!任${roomarr[ingg][0]}万般无奈,但事实已定,什么也没有发生】\n【空弹!什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 2) {
                    session.send(`【${roomarr[ingg][0]}已然汗流浃背,手臂不自觉地轻微抖动,呼吸变得越来越急促。仿佛用尽全身力气,猛的扣动扳机。随着一声沉闷的"卡嗒"声${roomarr[ingg][0]}脸色苍白无比,耳中回响起轰鸣声。\n空弹!${roomarr[ingg][0]}不敢相信这一切,他能感受到来自地狱的死神的视线,耳鸣声中仿佛夹杂着死神和对手讥讽他的话语。】\n【空弹!什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发\n${roomarr[0][1]}】\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                }
              }
              if (session.content == 'n' && state == 3 && session.userId == roomarr[ing][1] && session.guildId == guildId) {
                bulletsarr.pop()
                bulletsarr[0]--;
                //弹匣更新
                if (bulletsarr[0] == 0) {
                  bullets(bulletsarr);
                  //随机存入子弹，0储存子弹总数量，1储存真子弹数量，剩下的代表子弹
                  props(roomarr, life);
                  //随机存入道具
                  session.send(`子弹已经耗光\n重新补充子弹\n本轮子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发\n新的道具已经发送给玩家\n`)
                }
                protest1.length = 0
                protest2.length = 0
                propstext(roomarr, protest1, protest2)
                let test1 = protest1.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                let test2 = protest2.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                //执行减少子弹，子弹数量检测并补充，刷新道具字符串，拼接道具字符串以便于显示给玩家
                if (bulletsarr[bulletsarr[0] + 1] % 2 == 1) {
                  ingg = ing
                  ing = huan(ing);
                  //ingg是本轮持枪者，ing是下一轮
                  bulletsarr[1]--;
                  //实弹数量更新
                  roomarr[ing][2] -= damage;
                  //伤害更新
                  damage = 1
                  //子弹伤害重置
                  if (stop == 1) {
                    ing = huan(ing);
                    stop = 0
                  }
                  if (roomarr[ingg][2] > 4) {
                    session.send(`${roomarr[ingg][0]}【眼神冰冷,猛地对准自己的胸膛扣动扳机。一声震耳欲聋的爆裂声后,鲜血如喷泉般喷涌而出。\n实弹!${roomarr[ingg][0]}终究遭遇了不幸,扣除一点生命值】\n【${roomarr[ingg][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发，实弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n ${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 4 && roomarr[ingg][2] > 2) {
                    session.send(`${roomarr[ingg][0]}【握紧手中的武器,冷汗顺着额角滑落。他举起枪口对准自己,深吸一口气扣动了扳机,一声沉闷的枪响过后,鲜血飞溅而出\n实弹!${roomarr[ingg][0]}的幸运女神没有降临,他危险了!】\n【${roomarr[ingg][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发，实弹弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ingg][2] <= 2) {
                    session.send(`${roomarr[ingg][0]}【已然汗流浃背,手臂不自觉地轻微抖动,呼吸变得越来越急促。抵着自己胸腔的枪口究竟会为他带来财富还是死亡？用尽全身力气，猛的扣动扳机。随着一声枪响,${roomarr[ingg][0]}满脸是血,耳中回响起轰鸣声。\n实弹!${roomarr[ingg][0]}不敢相信这一切,他能感受到来自地狱的死神的视线,耳鸣声中仿佛夹杂着死神和对手讥讽他的话语。】\n【${roomarr[ingg][0]}受到${damage}点伤害！】\n【剩余子弹共${bulletsarr[0]}发，真弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ing][2] <= 0) {
                    ingg = ing
                    ing = huan(ing);
                    session.send(`${roomarr[ingg][0]}亲手断绝了自己的生机,临获胜！幽暗的密室内,突然挂起一阵狂风,裹挟着诡异的黑色气体构成了死神的虚影,挥起那诡异黑气构成的镰刀,${roomarr[ingg][0]}的灵魂已经永远归属于死神,狂风散去,仿佛一切都没有发生。\n败者食尘!赢家通吃!${roomarr[ing][0]}一脚踢开败者的残躯,拿走了对方当作赌注的财富`)
                    dispose3();
                    state = 0;
                    session.send(`游戏已被关闭`)
                  }
                }
                else {
                  ing = ing
                  ingg = huan(ing)
                  //向自己开并空枪，下轮依旧可以继续开枪，所以这里ing表本轮持枪者，ingg表对手
                  damage = 1;
                  //伤害重置
                  if (roomarr[ing][2] > 4) {
                    session.send(`【${roomarr[ing][0]}眼神冰冷,猛地对准自己的胸膛扣动扳机。 "卡嗒"一声,什么也没有发生\n空弹!${roomarr[ing][0]}充满信心，微笑着思索着下一步行动】\n【空弹，什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发，实弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ing][2] <= 4 && roomarr[ing][2] > 2) {
                    session.send(`【${roomarr[ing][0]}握紧手中的武器,冷汗顺着额角滑落。他举起枪口对准自己,深吸一口气扣动了扳机,一声沉闷的"卡嗒"声,枪口没有喷射出恐怖的火舌。\n空弹!${roomarr[ing][0]}长长的吐出一口气,如释重负,看着对手凝重的面容${roomarr[ing][0]}微微一笑】\n【空弹，什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发，实弹弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                  if (roomarr[ing][2] <= 2) {
                    session.send(`【${roomarr[ing][0]}已然汗流浃背,手臂不自觉地轻微抖动,呼吸变得越来越急促。${roomarr[ing][0]}直到,这颗子弹可能会摧毁一切他的一切,也可能会让他拥有一切。猛的扣动扳机。"卡嗒"一声,只有空弹的响动在安静的房间里回荡。\n空弹!${roomarr[ing][0]}止不住的大笑,看着敌人不敢置信的表情,${roomarr[ing][0]}露出了残忍的笑容】\n【空弹，什么也没有发生】\n【剩余子弹共${bulletsarr[0]}发，真弹${bulletsarr[1]}发，空弹${bulletsarr[0] - bulletsarr[1]}发】\n${roomarr[0][1]}\n生命值:${roomarr[0][2]}\n道具:${test1}\n${roomarr[1][1]}\n生命值:${roomarr[1][2]}\n道具:${test2}\n【现在是${roomarr[ing][0]}的回合】,y攻击对方,n攻击自己,e关闭游戏,数字使用道具,请出手`)
                  }
                }
              }
              let propsnumber = Number(session.content)
              //字符串数字转化为数字类型
              if (typeof propsnumber === 'number' && state == 3 && session.userId == roomarr[ing][1] && session.guildId == guildId) {
                let realpropsnumber = roomarr[ing][propsnumber + 2]
                //根据用户发送的序号找到roomarr数组中对应位置的道具的真实序号
                roomarr[ing].splice(propsnumber + 2, 1)
                //删除对应道具元素
                protest1.length = 0
                protest2.length = 0
                propstext(roomarr, protest1, protest2)
                let test1 = protest1.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                let test2 = protest2.reduce((acc, curr, index) => {
                  if (typeof curr === 'string') {
                    return acc + `${index + 1}. ${curr} `;
                  }
                  return acc;
                }, '');
                //删除道具后更新字段
                let a = huan(ing)
                //表示对手,因为进行该操作之后不进入下一回合，如果这里还用ingg，可能会导致意想不到的bug
                if (realpropsnumber == 1) {
                  stop = 1;
                  session.send(`${roomarr[ing][0]}猛地掏出一副手铐,狠狠地铐住了${roomarr[a][0]}的双手!${roomarr[a][0]}挣扎不已,但徒劳无功。\n看来下一回合,${roomarr[a][0]}将无法行动!`)
                }
                if (realpropsnumber == 2) {
                  roomarr[ing][2]++;
                  session.send(`${roomarr[ing][0]}拿起一根香烟,熟练地掏出打火机点燃,缓缓吐出一口白色的烟雾,烟雾在空中盘旋了片刻,${roomarr[ing][0]}感觉身体的疲惫逐渐消散,生命力像是被注满般涌了回来。${roomarr[ing][0]}回复了一点生命值!`)
                }
                if (realpropsnumber == 3) {
                  if (bulletsarr[bulletsarr[0] + 1] % 2 == 1) {
                    session.send(`${roomarr[ing][0]}拿起了放大镜,随手将镜子拍碎在桌子上,透过破碎的镜片,他得以窥探那把来自地狱的枪内的虚实！\n${roomarr[ing][0]}邪魅一笑,下一发子弹是【真弹】！`)
                  }
                  else {
                    session.send(`${roomarr[ing][0]}拿起了放大镜,随手将镜子拍碎在桌子上,透过破碎的镜片,他得以窥探那把来自地狱的枪内的虚实！\n${roomarr[ing][0]}的表情捉摸不透,下一发子弹是【空弹】！`)
                  }

                }
                if (realpropsnumber == 4) {//该道具特殊，会消耗子弹
                  if (bulletsarr[bulletsarr[0] + 1] % 2 == 1) {
                    bulletsarr.pop()
                    bulletsarr[0]--;
                    bulletsarr[1]--;
                  }
                  else {
                    bulletsarr.pop()
                    bulletsarr[0]--;
                  }
                  session.send(`${roomarr[ing][0]}抓起桌上的一瓶冰凉的啤酒,仰头就是一大口。凉爽的液体顺喉而下,瞬间缓解了紧张的神经。\n满怀轻松的${roomarr[ing][0]}轻轻把下一发子弹从枪膛中推了出去,眼神带着些许戏谑地看向对手。`)
                  if (bulletsarr[0] == 0) {
                    bullets(bulletsarr);
                    //随机存入子弹，0储存子弹总数量，1储存真子弹数量，剩下的代表子弹
                    props(roomarr, life);
                    //随机存入道具
                    session.send(`子弹已经耗光\n重新补充子弹\n本轮子弹共${bulletsarr[0]}发,真弹${bulletsarr[1]}发,空弹${bulletsarr[0] - bulletsarr[1]}发\n新的道具已经发送给玩家\n`)
                  }
                  protest1.length = 0
                  protest2.length = 0
                  propstext(roomarr, protest1, protest2)
                  let test1 = protest1.reduce((acc, curr, index) => {
                    if (typeof curr === 'string') {
                      return acc + `${index + 1}. ${curr} `;
                    }
                    return acc;
                  }, '');
                  let test2 = protest2.reduce((acc, curr, index) => {
                    if (typeof curr === 'string') {
                      return acc + `${index + 1}. ${curr} `;
                    }
                    return acc;
                  }, '');
                  //执行减少子弹，子弹数量检测并补充，刷新道具字符串，拼接道具字符串以便于显示给玩家
                }
                if (realpropsnumber == 5) {
                  let m = bulletsarr[0] + 1
                  let n = Math.floor(Math.random() * (m - 1)) + 2;
                  let z = bulletsarr[0] - n + 1
                  let type = '实弹'
                  if (bulletsarr[n] % 2 == 1) {
                    type = '实弹'
                  }
                  else {
                    type = '空弹'
                  }
                  session.send(`${roomarr[ing][0]}拿起手机，拨打了通往地狱的电话，电话的那头隐隐传来一阵嘶哑的叫声，在得到了满意的答案后，${roomarr[ing][0]}随手将手机丢掉\n他已然知晓，第${z}发子弹是${type}!`)
                }
                if (realpropsnumber == 6) {
                  if (bulletsarr[bulletsarr[0] + 1] % 2 == 1) {
                    bulletsarr[bulletsarr[0] + 1] = 2
                  }
                  else {
                    bulletsarr[bulletsarr[0] + 1] = 3
                  }
                  session.send(`${roomarr[ing][0]}从腰间的装备包里掏出一个造型奇特的小型装置,只见一道微弱的蓝光从逆转器中闪烁而出,笼罩在枪的周围。\n${roomarr[ing][0]}嘴角勾起一抹得意的笑容,他已经成功逆转了那发子弹的虚实属性。`)
                }
                if (realpropsnumber == 7) {//该道具特殊，会造成伤害
                  let num1 = Math.floor(Math.random() * 10) + 1;
                  if (num1 >= 4) {
                    roomarr[ing][2] += 2;
                    session.send(`${roomarr[ing][0]}拿起一瓶不知名的药品,仔细端详了一番。他眯起眼睛,似乎在怀疑这药是否还能吃。\n"${roomarr[ing][0]}下定决心,咬牙服下了那瓶药品。\n过了一会儿，${roomarr[ing][0]}并没有感到任何不适应，一股暖流涌上心头，看来这药依旧可用。\n${roomarr[ing][0]}回复两点生命值`)
                  }
                  else {
                    roomarr[ing][2]--
                    session.send(`${roomarr[ing][0]}拿起一瓶不知名的药品,仔细端详了一番。他眯起眼睛,似乎在怀疑这药是否还能吃。\n"${roomarr[ing][0]}下定决心,咬牙服下了那瓶药品。\n只见${roomarr[ing][0]}脸色一变,剧烈咳嗽起来,看来这药品已经过期变质了。\n${roomarr[ing][0]}失去一点生命值`)
                    if (roomarr[ing][2] <= 0) {
                      ingg = ing
                      ing = huan(ing);
                      session.send(`${roomarr[ingg][0]}亲手断绝了自己的生机,临获胜！幽暗的密室内,突然挂起一阵狂风,裹挟着诡异的黑色气体构成了死神的虚影,挥起那诡异黑气构成的镰刀,${roomarr[ingg][0]}的灵魂已经永远归属于死神,狂风散去,仿佛一切都没有发生。\n败者食尘!赢家通吃!${roomarr[ing][0]}一脚踢开败者的残躯,拿走了对方当作赌注的财富`)
                      dispose3();
                      state = 0;
                      session.send(`游戏已被关闭`)
                    }
                  }

                }
                if (realpropsnumber == 8) {
                  damage = 2;
                  session.send(`${roomarr[ing][0]}拿起一把锋利的小刀,刀刃在灯光下闪烁着寒光。他凝视着刀锋,眼中闪过一丝狠戾。\n猛地砍向那把枪的枪口，随着枪口的破碎，下一发子弹的杀伤力已经得到了大幅提升,\n下一发子弹伤害+1`)
                }
                if (realpropsnumber >= 1 && realpropsnumber <= 8) {//当数字在对应范围内的时候，展示剩余道具
                  if (ing == 0) {
                    session.send(`${roomarr[ing][0]}\n生命值:${roomarr[ing][2]}\n道具:${test1}\n`)
                  }
                  else {
                    session.send(`${roomarr[ing][0]}\n生命值:${roomarr[ing][2]}\n道具:${test2}\n`)
                  }
                }
              }
              if (session.content == 'e' && state == 3) {//退出键
                dispose3();
                state = 0;
                session.send(`游戏已被关闭`)
              }
            })
          }
        })

      })
      return '【恶魔轮盘赌】\n1:签订死神契约的双方坐在桌子的两端,桌子上摆放一把猎枪\n2:猎枪内随机装填实弹和空弹,空弹不能造成伤害\n3:两位玩家依次轮流获得猎枪的使用权,可以选择朝对方或者自己开枪\n4:如果朝对方开枪,无论是否造成伤害,下一回合对方获得猎枪使用权\n5:如果朝自己开枪.并且是空弹,则额外获得一回合猎枪使用权,反之则下一回合对方获得猎枪使用权\n6:两位玩家随机获得同等的生命值\n7:两位玩家通过掷骰子决定先后手,后手玩家额外获得一点生命值\n8:两位玩家随机获得数量为生命值一半的道具\n9:当子弹全部打光的时候,将会重新补充子弹,并再次给予一次道具\n【输入1签订死神契约开启恶魔轮盘赌】';
    });
}


function bullets(bullarr) {
  bullarr[0] = Math.floor(Math.random() * 5) + 3;
  bullarr[1] = 0;
  //0储存子弹总数量，1储存真子弹数量
  for (let i = 2; i < bullarr[0] + 2; i++) {
    bullarr[i] = Math.floor(Math.random() * 4) + 4;
    if (bullarr[i] % 2 == 1) {
      bullarr[1]++
    }
  }
  //随机子弹，奇数是实弹，偶数是虚弹
}

function props(propsarr, life) {
  let propsnum = life / 2;
  for (let i = 0; i < propsnum; i++) {
    propsarr[0].push(Math.floor(Math.random() * 8) + 1);
  }
  for (let i = 0; i < propsnum; i++) {
    propsarr[1].push(Math.floor(Math.random() * 8) + 1);
  }
  //随机存入道具
}

function propstext(arr1, arr2, arr3) {
  for (let i = 3; i < arr1[0].length + 3; i++) {
    if (arr1[0][i] == 1) {
      arr2[i - 3] = '手铐：禁锢对方一回合\n'
    }
    if (arr1[0][i] == 2) {
      arr2[i - 3] = '香烟：回复一点生命值\n'
    }
    if (arr1[0][i] == 3) {
      arr2[i - 3] = '放大镜：查看下一发子弹是否是真弹\n'
    }
    if (arr1[0][i] == 4) {
      arr2[i - 3] = '啤酒：推掉下一发子弹\n'
    }
    if (arr1[0][i] == 5) {
      arr2[i - 3] = '手机：随机得知一发子弹的类型\n'
    }
    if (arr1[0][i] == 6) {
      arr2[i - 3] = '逆转器：逆转下一发子弹的虚实\n'
    }
    if (arr1[0][i] == 7) {
      arr2[i - 3] = '过期药品：40%概率回复两点生命值，否则扣除一点生命值\n'
    }
    if (arr1[0][i] == 8) {
      arr2[i - 3] = '小刀：下一发子弹伤害+1\n'
    }
  }
  for (let i = 3; i < arr1[1].length + 3; i++) {
    if (arr1[1][i] == 1) {
      arr3[i - 3] = '手铐：禁锢对方一回合\n'
    }
    if (arr1[1][i] == 2) {
      arr3[i - 3] = '香烟：回复一点生命值\n'
    }
    if (arr1[1][i] == 3) {
      arr3[i - 3] = '放大镜：查看下一发子弹是否是真弹\n'
    }
    if (arr1[1][i] == 4) {
      arr3[i - 3] = '啤酒：推掉下一发子弹\n'
    }
    if (arr1[1][i] == 5) {
      arr3[i - 3] = '手机：随机得知一发子弹的类型\n'
    }
    if (arr1[1][i] == 6) {
      arr3[i - 3] = '逆转器：逆转下一发子弹的虚实\n'
    }
    if (arr1[1][i] == 7) {
      arr3[i - 3] = '过期药品：40%概率回复两点生命值，否则扣除一点生命值\n'
    }
    if (arr1[1][i] == 8) {
      arr3[i - 3] = '小刀：下一发子弹伤害+1\n'
    }
  }
}
function huan(a) {
  if (a == 0) {
    return 1;
  }
  return 0;
}
