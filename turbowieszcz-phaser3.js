
/*
Turbo Wieszcz ++ Phaser3 version (JavaScript), v2.0
(c)2022 noniewicz.com
cre: 20220514
upd: 20220515, 16, 17, 18, 19, 20, 26, 27
upd: 20220601
*/

/* TODO:
- ?
*/


//globals
const yn = ['NIE', 'TAK'];
var cnt = 4;
var rym = 0;
const ryms = ['ABAB', 'ABBA', 'AABB'];
var powt = 0;
var twauto = 0;
var msx = 0;
const msx_types = ['NIE', 'C64', 'ZX48'];
var fnt_size = 1;
const fnt_sizes = ['16', '20', '24', '28'];
var fnt_type = 1;
const fnt_types = ['Courier New', 'Maszyna', 'MaszynaAEG'];
const fnt_types_disp = ['Courier', 'Maszyna', 'Maszyna2'];
var fnt_bold = 0;
var fnt_color = 1;
const fnt_colors = ['#e0e0e0', '#ffff60', '#ff2000', '#40ff90'];
const fnt_colors_disp = ['biały', 'żółty', 'czerwony', 'zielony'];
var popup = false;

//TTS
var synth, voices, ttsready=false, ttslang_ids=[]; ttslang_names=[], ttslang=0, tts_on=0;
try
{
    synth = window.speechSynthesis;
    var voices = synth.getVoices();
    for(var i = 0; i < voices.length; i++)
    {
        if (voices[i].lang == 'pl-PL') //comment this to use all avail voices, not only PL
        {
            ttslang_ids.push(voices[i]);
            var n = voices[i].name.replace('Microsoft ', '').replace('Desktop ', '').replace(' - ', ' ');
            const ndx = n.indexOf('(');
            if (ndx >= 0) n = n.substring(0, ndx);
            ttslang_names.push(n);
        }
        //console.log(i + ' voice: ' + voices[i].name + ' / ' + voices[i].lang);
    }
    ttsready = ttslang_names.length > 0;
}
catch (error)
{
    console.error('TTS init failed: '+error);
}

function dec_cnt()
{
    if (cnt>1) cnt--;
}

function inc_cnt()
{
    if (cnt<32) cnt++;
}

function next_rym()
{
    rym = rym + 1;
    if (rym == ryms.length) rym = 0;
}

function next_powt()
{
    powt = (powt+1)&1;
}

function next_auto()
{
    twauto = (twauto+1)&1;
}

function next_msx()
{
    msx = msx+1;
    if (msx == msx_types.length) msx = 0;
}

function next_font_size()
{
    fnt_size = fnt_size+1;
    if (fnt_size == fnt_sizes.length) fnt_size = 0;
}

function next_font_type()
{
    fnt_type = fnt_type+1;
    if (fnt_type == fnt_types.length) fnt_type = 0;
}

function next_color()
{
    fnt_color = fnt_color+1;
    if (fnt_color == fnt_colors.length) fnt_color = 0;
}

function next_bold()
{
    fnt_bold = (fnt_bold+1)&1;
}

function next_tts()
{
    ttslang = ttslang+1;
    if (ttslang == ttslang_ids.length) ttslang = 0;
}

function next_tts_enable()
{
    tts_on = (tts_on+1)&1;
    if (ttsready && !tts_on) nsay();
}

function createmenu(o, what)
{
    menu = o.add.image(1000-20, 20, 'menu');
    menu.setAlpha(0.7);
    menu.setInteractive();
    menu.on('pointerover', function() { this.menu.setAlpha(1.0); }, o);
    menu.on('pointerout', function() { this.menu.setAlpha(0.7); }, o);
    menu.on('pointerup', function() {
        popup = !popup;
        const sc = this.scene.get("TWMenu");
        sc.click();
        if (popup)
            {this.scene.launch("TWMenu", {what: what}); this.scene.bringToTop('TWMenu');}
        else
            {this.scene.stop("TWMenu");}
    }, o);

    return menu;
}

function openExternalLink(url)
{
    var s = window.open(url, '_blank');
    if (s && s.focus) s.focus(); else if (!s) window.location.href = url;
}

//src: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
  
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    }
    catch (err)
    {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard)
    {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(
        function() { console.log('Async: Copying to clipboard was successful!'); }, 
        function(err) { console.error('Async: Could not copy text: ', err); }
    );
}

function say(txt, voiceid)
{
    if ((synth != null) && (txt != null) && (txt != undefined))
    {
      if (voiceid === undefined) voiceid = 0;
      var utterThis = new SpeechSynthesisUtterance(txt);
      utterThis.voice = voices[voiceid];
      synth.speak(utterThis);
    }
}

function nsay()
{
    if (synth != null) synth.cancel();
}


class TWTitle extends Phaser.Scene {
    ready = false;
    switching = false;

    constructor ()
    {
        super({ key: 'TWTitle', active: true });
    }

    preload ()
    {
        this.load.image('menu', 'assets/menubn.png');
        this.load.image('bg', 'assets/cyberspace2a.jpg');
        this.load.spritesheet('adam_sprites', 'assets/cyberadam.jpg', { frameWidth: 40, frameHeight: 40 });
        this.load.audio('next', 'assets/twstart.mp3');
        this.load.audio('click', 'assets/click.mp3');
        this.load.audio('msx_c64', 'assets/twc64.mp3');
        this.load.audio('msx_zx', 'assets/twzx.mp3');
    }

    create ()
    {
        this.width = this.sys.game.scale.gameSize.width;
        this.height = this.sys.game.scale.gameSize.height;

        this.input.keyboard.on('keyup', function(event) {
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.S) this.startNext(0);
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.O) this.startNext(1);
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.M) { next_msx(); this.musicOnOff(); }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) this.startTWScene();

        }, this);

        const img = this.add.image(this.width/2, this.height/2, 'bg').setInteractive();
        img.on('pointerup', function() {this.startNext(0);}, this);

        popup = false;
        this.menu = createmenu(this, 'title');

        //img from 10x10 sprites
        this.s = [[], [], [], [], [], [], [], [], [], []];
        this.a = [];
        for (var y=0;y<10;y++)
        for (var x=0;x<10;x++)
        {
            this.s[y][x] = this.add.sprite((this.width-400)/2+x*40+20, (this.height-400)/2+y*40+20, 'adam_sprites', y*10+x);
            this.physics.world.enable(this.s[y][x], Phaser.Physics.Arcade.DYNAMIC_BODY);
            this.s[y][x].body.setAllowGravity(false);
            this.s[y][x].setAlpha(0);
            this.a.push(this.s[y][x]);
        }

        this.music_c64 = this.sound.add('msx_c64', { loop: true });
        this.music_zx = this.sound.add('msx_zx', { loop: true });
        this.musicOnOff();

        this.tweens.add({
            targets: this.a,
            alpha: { start: 0, to: 1 }, 
            rotation: { start: 45, to: 0 }, 
            scale: { start: 3, to: 1 }, 
            ease: 'Linear',
            duration: 1000,
            repeat: 0,
            yoyo: false,
            onCompleteScope: this,
            onComplete: this.initLogo,
        });
    }

    initLogo ()
    {
        this.txt = this.add.text(100, 100, 'TURBO WIESZCZ++', { font: '72px SHLOP', fill: '#ff2020' });
        this.txt.setShadow(3, 3, "#222222", 2+4, false, true);
        this.physics.world.enable(this.txt, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.txt.body.setVelocity(100*2, 50);
        this.txt.body.setBounce(1, 1);
        this.txt.body.setCollideWorldBounds(true);
        this.ready = true;
    }

    startNext(id) {
        if (!this.ready || this.switching) return;
        popup = false;
        this.switching = true;
        for (var y=0;y<10;y++)
        for (var x=0;x<10;x++)
        {
            var vx = this.getRandomInt(200)-this.getRandomInt(200);
            var vy = -this.getRandomInt(300);
            this.s[y][x].body.setVelocity(vx, vy);
            this.s[y][x].body.setAllowGravity(true);
        }
        this.txt.body.setBounce(0, 0);
        this.txt.body.setCollideWorldBounds(false);
        this.sound.add('next').play();
        if (id == 0) this.time.addEvent({ delay: 3000, callback: this.startTWScene, callbackScope: this, loop: false });
        if (id == 1) this.time.addEvent({ delay: 3000, callback: this.startAbout, callbackScope: this, loop: false });
    }

    startTWScene() { this.switching = false; this.scene.start("TWMain"); }
    startAbout() { this.switching = false; this.scene.start("TWAbout", {from: 'title'}); }

    musicOnOff() {
        this.music_c64.stop();
        this.music_zx.stop();
        if (msx == 1) this.music_c64.play();
        if (msx == 2) this.music_zx.play();
    }

    getRandomInt(max) { return Math.floor(Math.random() * max); }
}


class TWMain extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'TWMain', active: false });
    }

    preload ()
    {
        this.load.image('bgx', 'assets/boxtxtr01.png');
        this.load.image('bgface', 'assets/cybergrid01-face.png');
        this.load.spritesheet('skull_sprite', 'assets/peter-keenan-skull-export-sheet.png', { frameWidth: 400, frameHeight: 400 });
    }

    create ()
    {
        this.width = this.sys.game.scale.gameSize.width;
        this.height = this.sys.game.scale.gameSize.height;

        this.input.keyboard.on('keyup', function(event) {
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
            popup = false; this.startMenu();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.O) {
            popup = false; this.startAbout();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) this.onNewPoemPrelude();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.N) this.onNewPoemPrelude();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) dec_cnt();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) inc_cnt();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT) dec_cnt();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD) inc_cnt();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.R) next_rym();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.P) next_powt();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A) next_auto();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.Z) {
            next_font_size(); this.setfont();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.F) {
            next_font_type(); this.setfont();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.M) {
            next_msx(); const sc = this.scene.get("TWTitle"); sc.musicOnOff();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.W) {
            copyTextToClipboard(this.poem);
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.B) {
            next_bold(); this.setfont();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.C) {
            next_color(); this.setfont();
          }
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.X) next_tts_enable();
          if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.V) next_tts();
        }, this);

        this.bg = this.add.image(this.width/2, this.height/2, 'bgx').setInteractive();
        this.bgf = this.add.image(this.width/2, this.height/2, 'bgface');
        this.bg.setAlpha(0);
        this.bgf.setAlpha(0);

        this.bg.on('pointerup', function() {this.onNewPoemPrelude();}, this);

        popup = false;
        this.menu = createmenu(this, 'main');

        this.skull = [];
        this.anims.create({
            key: 'skull',
            frames: this.anims.generateFrameNumbers('skull_sprite', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1
        });

        for (var i=0;i<8;i++)
        {
            this.skull[i] = this.add.sprite(0, 0, 'skull_sprite');
            this.skull[i].anims.play('skull', true);
            this.skull[i].x = 50+this.getRandomInt(this.width-100);
            this.skull[i].y = -50-this.getRandomInt(2000);
            this.skull[i].speed = 2+this.getRandomInt(10);
            //this.skull[i].setScale(0.25);
            this.skull[i].setScale(0.25-(this.getRandomInt(15))/100);
        }

        this.poem = "";
        this.poemlines = [];
        this.work = false;
        this.must_scroll = false;
        this.line = 0;

        this.timer = this.time.addEvent({ delay: 5000, callback: function() {if (twauto) this.onNewPoemPrelude();}, callbackScope: this, paused: true, loop: true });

        this.tw_txt = this.add.text(290, 20, '');

        this.tweens.add({
            targets: this.bg,
            alpha: { start: 0, to: 1 }, 
            ease: 'Linear',
            duration: 600,
            repeat: 0,
            yoyo: false,
            onCompleteScope: this,
            onComplete: this.onNewPoemPrelude,
        });

        this.facetw = this.tweens.add({
            targets: this.bgf,
            alpha: { start: 0, to: 0.95 },
            ease: 'Linear',
            delay: 200,
            duration: 1000,
            completeDelay: 500,
            repeat: 0,
            yoyo: true,
            onCompleteScope: this,
            onComplete: function() {this.facetw.stop(); this.onNewPoem();},
            paused: true
        });

        this.out1 = this.tweens.add({ //znikanie - alpha
            targets: this.tw_txt,
            alpha: { start: 1, to: 0 }, 
            ease: 'Linear',
            duration: 1200,
            repeat: 0,
            yoyo: false,
            onCompleteScope: this,
            onComplete: function() {this.out1.stop(); this.tw_txt.setText(""); this.onNewPoemPrelude();},
            paused: true
        });

        this.out2 = this.tweens.add({ //znikanie - alpha + scale
            targets: this.tw_txt,
            alpha: { start: 1, to: 0 }, 
            scale: { start: 1, to: 0.1 }, 
            x: { start: this.tw_txt.x, to: this.tw_txt.x+100 }, 
            y: { start: this.tw_txt.y, to: this.tw_txt.y+300 }, 
            ease: 'Linear',
            duration: 1200,
            repeat: 0,
            yoyo: false,
            onCompleteScope: this,
            onComplete: function() {this.out2.stop(); this.tw_txt.setText(""); this.onNewPoemPrelude();},
            paused: true
        });


    }

    update (time)
    {
        this.onWork();

        for (var i=0;i<this.skull.length;i++)
        {
            this.skull[i].y += this.skull[i].speed;
            if (this.skull[i].y > this.height+50)
            {
                this.skull[i].x = 50+this.getRandomInt(1000-100);
                this.skull[i].y = -50-this.getRandomInt(2000);
                this.skull[i].speed = 2+this.getRandomInt(10);
                this.skull[i].setScale(0.25-(this.getRandomInt(15))/100);
            }
        }
    }

    setfont()
    {
	var b;
	if (fnt_bold) b = "bold"; else b = "";
        const fs = { font: b+' '+fnt_sizes[fnt_size]+'px '+fnt_types[fnt_type], fill: fnt_colors[fnt_color] };
        this.tw_txt.setStyle(fs);
    }

    onNewPoemPrelude()
    {
        if ((this.tw_txt.text.trim() != "") && (!this.must_scroll)) //1st to remove old poem in cool way, but not when must scroll
        {
            //console.log('onNewPoemPrelude clear old');
            var n = this.getRandomInt(3+1);
            if (n == 0) this.out1.play();
            if (n == 1) this.out2.play();
            if (n >= 2)
            {
                this.out3 = this.tweens.add({ //znikanie - alpha + scale + rotate + out of screen
                    targets: this.tw_txt,
                    alpha: { start: 1, to: 0 }, 
                    scale: { start: 1, to: 0.3 }, 
                    angle: { start: 0, to: 20+this.getRandomInt(30) }, 
                    x: { start: this.tw_txt.x, to: -this.tw_txt.x-this.tw_txt.width-100 }, 
                    y: { start: this.tw_txt.y, to: this.tw_txt.y+300+this.getRandomInt(200) }, 
                    ease: 'Linear',
                    duration: 1200,
                    repeat: 0,
                    yoyo: false,
                    onCompleteScope: this,
                    onComplete: function() {this.out3.stop(); this.out3.remove(); this.tw_txt.setText(""); this.onNewPoemPrelude();},
                    paused: true
                });
                this.out3.play();
            }
        }
        else
        {
            //console.log('onNewPoemPrelude start new face');
            this.tw_txt.setText("");
            this.facetw.play();
        }
    }

    onNewPoem()
    {
        //console.log('onNewPoem');
        this.timer.paused = true;

        this.setfont();
        this.poem = generate_poem(cnt, rym, powt);
        this.poemlines = this.poem.split('\n');

        this.tw_txt.setText("");
        this.tw_txt.y = 20;

        const line_h = this.tw_txt.height;
        this.total_h = line_h*this.poemlines.length;
        this.avail_h = this.height - this.tw_txt.y * 1.75; //almost 2
        if (this.total_h > this.avail_h+10) this.must_scroll = true; else this.must_scroll = false;
        //console.log('line_h='+line_h+' total_h='+this.total_h+' poemlines='+this.poemlines.length+' avail_h='+this.avail_h+' must_scroll='+this.must_scroll);

        this.tw_txt.x = 290;
        if (this.must_scroll)
        {
            this.tw_txt.y = this.height;
            this.tw_txt.setText(this.poem); //whole poem at once if scroll
            this.timer.delay = 3000;
            this.timer.paused = true;
        }
        else
        {
            this.tw_txt.y = 20;
            this.timer.delay = 2100*this.poemlines.length;
            this.timer.paused = false;
        }
        this.tw_txt.alpha = 1.0;
        this.tw_txt.scale = 1.0;
        this.tw_txt.rotation = 0;
        this.line = 0;
        this.work = true;
        if (ttsready && tts_on) {nsay(); say(this.poem, ttslang);}
    }

    onWork()
    {
        if (this.work)
        {
            if (this.must_scroll)
            {
                this.tw_txt.y -= 1;
                if (this.tw_txt.y+this.tw_txt.height <= 20) { this.work = false; this.timer.paused = false; }
            }
            else
            {
                var sline = this.poemlines[this.line];
                var t = this.tw_txt.text + sline + "\n";
                this.tw_txt.setText(t);
                this.line += 1;
                if (this.line >= this.poemlines.length) { this.work = false; }
            }
        }
        else
        {
            this.timer.paused = false;
        }

    }

    startMenu() { this.scene.start("TWTitle"); }
    startAbout() { this.scene.start("TWAbout", {from: 'main'}); }

    getRandomInt(max) { return Math.floor(Math.random() * max); }
}


class TWAbout extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'TWAbout', active: false });
    }

    init(params)
    {
        this.from = params.from;
    }

    create ()
    {
        this.width = this.sys.game.scale.gameSize.width;
        this.height = this.sys.game.scale.gameSize.height;

        this.input.keyboard.on('keyup', function(event) {
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) this.getBack();
            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.W) this.more();
        }, this);

        const img = this.add.image(this.width/2, this.height/2, 'bg').setInteractive();
        img.on('pointerup', function() {this.getBack();}, this);

        this.txt = this.add.text(250, 10, 'TURBO WIESZCZ++', { font: '72px SHLOP', fill: '#ff2020' });
        this.txt.setShadow(3, 3, "#222222", 2+4, false, true);

        popup = false;
        this.menu = createmenu(this, 'about');

        const s = 
          "TurboWieszcz++ v2.0 - generator poezji - oficjalna wersja online!\n"+
          "©2022 Noniewicz.com, Jakub Noniewicz aka MoNsTeR/GDC\n"+
          "\n"+
          "Dodatkowe strofy (c): Grych, Freeak, Monster, Fred i Marek Pampuch.\n\n"+
          "Wer. JavaScript/Phaser3 oparta na poprzedniej wersji napisanej w C\n"+
          "przetłumaczonej z wersji w Lazarusie\n"+
          "przetłumaczonej z kolei z wersji w Delphi\n"+
          "opartej na wersji napisanej na Commodore C-64 gdzieś w 1993\n"+
          "przeze mnie i Wojtka (Freeak-a) Kaczmarka,\n"+
          "opartej z kolei na pomyśle z czasopiśma\n"+
          "\"Magazyn Amiga\" autorstwa Marka Pampucha.\n\n"+
          "Zainspirowany również wersją napisaną na iPhone-a\n"+
          "oraz w Amiga E przez Tomka (Grycha) Gryszkiewicza.\n\n"+
          "Historia programu została opisana w magazynie Ha!art 47 3/2014.\n\n"+
          "Kod + grafika + efekty audio: MoNsTeR/GDC\n"+
          "Muzyka: V0Yager (z wersji na ZX Spectrum)\n"+
          "Czcionki: różne darmowe (Maszyna Plus, MaszynaAEG, Shlop)\n"+
          "Czaszki: Peter Keenan, znalezione @ Artstation.com";

        this.a = this.add.text(this.width/2-30, 100, s, { font: 'bold 19px Courier new', fill: '#f0f0f0' });
        this.tweens.add({
            targets: this.a,
            alpha: { start: 0, to: 1 }, 
            scale: { start: 0.01, to: 1 }, 
            x: { start: this.width/2-30, to: 150 }, 
            rotation: { start: 45, to: 0 }, 
            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back' | 'Power2' 'Bounce.easeOut' 'Sine.easeInOut'
            duration: 800,
            repeat: 0,
            yoyo: false
        });
    }

    getBack() { if (this.from == 'title') this.startMenu(); else this.startTWScene(); }
    startTWScene() { this.scene.start("TWMain"); }
    startMenu() { this.scene.start("TWTitle"); }
    more() { openExternalLink('http://noniewicz.com/product.php?l=2&key=tw'); }
}


class TWMenu extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'TWMenu', active: false });
    }

    init(params)
    {
        this.what = params.what;
    }

    create ()
    {
        this.width = this.sys.game.scale.gameSize.width;
        this.height = this.sys.game.scale.gameSize.height;

        this.keys = [];
        if (this.what == 'title') this.keys = [10, 7, 8];
        if (this.what == 'main')
        {
            if (ttsready)
                this.keys = [0, 1, 2, 3, 4, 5, 6, 12, 13, 7, 15, 16, 11, 8, 9];
            else
                this.keys = [0, 1, 2, 3, 4, 5, 6, 12, 13, 7, 11, 8, 9];
        }
        if (this.what == 'about') this.keys = [14, 9];

        this.dy = 33;
        const w = 320;
        const h = 12+this.dy*this.keys.length;
        const x0 = 10;
        this.bnx = this.width-w+x0;
        this.bny = 44+10;
        this.bnw = 275+20;

        this.head_graphics = this.add.graphics().setInteractive();
        this.head_graphics.fillStyle(0x303030, 0.8);
        this.head_graphics.fillRect(this.width-w, 44, w-6, h);

        this.m = [];
        for (var i=0;i<this.keys.length;i++) this.m[i] = this.additem(i, this.bnw);

        this.f = [];
        this.f[0] = function() {this.click(); this.hide(); const sc = this.scene.get("TWMain"); sc.onNewPoemPrelude();};
        this.f[1] = function() {}; //unused
        this.f[2] = function() {this.click(); next_rym();}
        this.f[3] = function() {this.click(); next_powt();}
        this.f[4] = function() {this.click(); next_auto();}
        this.f[5] = function() {this.click(); next_font_size(); const sc = this.scene.get("TWMain"); sc.setfont();}
        this.f[6] = function() {this.click(); next_font_type(); const sc = this.scene.get("TWMain"); sc.setfont();}
        this.f[7] = function() {this.click(); next_msx(); const sc = this.scene.get("TWTitle"); sc.musicOnOff();}
        this.f[8] = function() {this.click(); this.hide(); 
            if (this.what == 'title')
                {const sc = this.scene.get("TWTitle"); if (!sc.switching) sc.startNext(1);}
            else
                {const sc = this.scene.get("TWMain"); sc.startAbout();}
        };
        this.f[9] = function() {
            this.click();
            this.hide(); 
            if (this.scene.isActive("TWMain")) this.scene.get("TWMain").startMenu();
            if (this.scene.isActive("TWAbout")) this.scene.get("TWAbout").getBack();
        };
        this.f[10] = function() {this.click(); this.hide(); const sc = this.scene.get("TWTitle"); if (!sc.switching) sc.startNext(0);};
        this.f[11] = function() {this.click(); const sc = this.scene.get("TWMain"); copyTextToClipboard(sc.poem);}
        this.f[12] = function() {this.click(); next_bold(); const sc = this.scene.get("TWMain"); sc.setfont();}
        this.f[13] = function() {this.click(); next_color(); const sc = this.scene.get("TWMain"); sc.setfont();}
        this.f[14] = function() {this.click(); const sc = this.scene.get("TWAbout"); sc.more();}
        this.f[15] = function() {this.click(); next_tts_enable(); }
        this.f[16] = function() {this.click(); next_tts(); }

        for (var i=0;i<this.m.length;i++)
        {
            var key = this.keys[i];
            this.m[i].setText(this.updmenu(key));
            if (key == 1) //inc/dec cnt - special case
            {
                var m_dec = this.additem(key, 40);
                var m_inc = this.additem(key, 40);
                m_dec.setText('(↓)');
                m_inc.setText('(↑)');
                m_inc.x = this.bnx + this.bnw - 40;
                m_dec.on('pointerover', function() { this.setAlpha(1.0); }, this.m[i]);
                m_dec.on('pointerout', function() { this.setAlpha(0.7); }, this.m[i]);
                m_inc.on('pointerover', function() { this.setAlpha(1.0); }, this.m[i]);
                m_inc.on('pointerout', function() { this.setAlpha(0.7); }, this.m[i]);
                m_dec.on('pointerup', function() {this.click();dec_cnt();}, this);
                m_inc.on('pointerup', function() {this.click(); inc_cnt();}, this);
            }
            else
            {
                this.m[i].on('pointerover', function() { this.setAlpha(1.0); }, this.m[i]);
                this.m[i].on('pointerout', function() { this.setAlpha(0.7); }, this.m[i]);
                this.m[i].on('pointerup', this.f[key], this);
            }
        }
    }

    update ()
    {
        this.updmenuall();
        if (!popup) this.scene.stop("TWMenu");
    }

    click()
    {
        this.sound.add('click').play();
    }

    hide ()
    {
        popup = false;
    }

    additem (n, w)
    {
        const fs = { font: 'bold 18px Courier New', fill: '#f0f0f0', backgroundColor: '#505050', fixedWidth: w, padding: {x: 8, y: 4} };
        var bn = this.add.text(this.bnx, this.bny+this.dy*n, '', fs).setAlpha(0.7).setInteractive();
        return bn;
    }

    updmenu (n)
    {
        var t = '';
        if (n == 0) t = '(N) Nowy wiersz';
        if (n == 1) t = '    Ilość zwrotek: '+cnt;
        if (n == 2) t = '(R) Typ rymów: '+ryms[rym];
        if (n == 3) t = '(P) Powtórzenia: '+yn[powt];
        if (n == 4) t = '(A) Tryb auto: '+yn[twauto];
        if (n == 5) t = '(Z) Rozmiar czcionki: '+fnt_sizes[fnt_size];
        if (n == 6) t = '(F) Czcionka: '+fnt_types_disp[fnt_type];
        if (n == 7) t = '(M) Muzyka: '+msx_types[msx];
        if (n == 8) t = '(O) O programie';
        if (n == 9) t = '(ESC) Powrót';
        if (n == 10) t = '(S) Start';
        if (n == 11) t = '(W) Kopiuj wiersz';
        if (n == 12) t = '(B) Bold: '+yn[fnt_bold];
        if (n == 13) t = '(C) Kolor: '+fnt_colors_disp[fnt_color];
        if (n == 14) t = '(W) Więcej online...';
        if (n == 15) t = '(X) Mowa: '+yn[tts_on];
        if (n == 16) t = '(V) Głos: '+ttslang_names[ttslang];
        return t;
    }

    updmenuall ()
    {
        for (var i=0;i<this.m.length;i++)
        {
            var key = this.keys[i];
            this.m[i].setText(this.updmenu(key));
        }
    }

}


  const config = {
    type: Phaser.AUTO,
    title: "Turbo Wieszcz ++",
    version: "2.0",
    width: 1000,
    height: 580,
    parent: 'game',
    pixelArt: true,
    disableContextMenu: true,
    backgroundColor: "#000000",
    scene: [TWTitle, TWMain, TWAbout, TWMenu],
    audio: {disableWebAudio: true},
    physics: {
      default: "arcade",
      arcade: {
        gravity: {y: 260},
      }
    }
  };

  const game = new Phaser.Game(config);
