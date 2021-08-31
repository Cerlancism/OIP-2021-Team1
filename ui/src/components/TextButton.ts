const InOut = Phaser.Easing.Quadratic.InOut;

const NoTintColor = 0xffffff;

export class TextButton extends Phaser.Button
{
    public text: Phaser.Text;

    private hoverTint: number;
    private pressedTint: number;
    private hasHoverTintEvents: boolean = false;
    private hasInputScaleEvents: boolean = false;
    private state: Phaser.State;
    private disabledFrame: number = 0;
    private downFrame: string | number;
    private callBack: Function;
    textStyleEnabled: Phaser.PhaserTextStyle = {};
    textStyleDisabled: Phaser.PhaserTextStyle = {};
    defaultScale: Phaser.Point = new Phaser.Point(1, 1);
    hoverScale: number;
    hoverTextOffset: Phaser.Point;
    defaultTextPosition: Phaser.Point;
    pressedScale: number;
    disabledAlpha: number = 1;

    constructor(game: Phaser.Game, x: number, y: number, key: number | string, text: string, callback?: Function, context?: any, overFrame?: string | number, outFrame?: string | number, downFrame?: string | number, upFrame?: string | number, centre = true)
    {
        super(game, x, y, key as string, undefined, undefined, overFrame, outFrame, downFrame, upFrame);
        this.state = this.game.state.getCurrentState();

        this.downFrame = downFrame;

        this.state.add.existing(this);
        this.anchor.set(centre ? 0.5 : 0);
        this.position.set(x, y);

        this.text = this.state.add.text(0, 0, text);
        this.text.anchor.set(0.5);
        this.text.alignIn(this, Phaser.CENTER);

        this.setCallBack(callback, context);

        // Need Test
        this.events.onAddedToGroup.add((obj: any, group: Phaser.Group) =>
        {
            group.add(this.text);
        });
    }

    setCallBack(callBack: Function, context?, isOnce = false)
    {
        if (!callBack)
        {
            return;
        }
        if (this.callBack)
        {
            this.events.onInputUp.remove(this.callBack, context);
        }
        this.callBack = callBack;
        if (isOnce)
        {
            this.events.onInputUp.addOnce((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, isOver ? this.callBack : () => { }, context))
        }
        else
        {
            this.events.onInputUp.add((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, isOver ? this.callBack : () => { }, context))
        }
        return this;
    }

    withStyle(styleEnabed: Phaser.PhaserTextStyle, styleDisabled?: Phaser.PhaserTextStyle, disabledFrame?: number): this
    {
        this.text.setStyle(styleEnabed);
        this.text.setShadow(styleEnabed.shadowOffsetX, styleEnabed.shadowOffsetY, styleEnabed.shadowColor, styleEnabed.shadowBlur);
        this.textStyleEnabled = styleEnabed;
        this.textStyleDisabled = styleDisabled || styleEnabed;
        this.disabledFrame = disabledFrame || this.disabledFrame;
        return this;
    }

    withDisabledAlpha(alpha: number)
    {
        this.disabledAlpha = alpha;
        return this;
    }

    withButtonScale(x: number, y?: number)
    {
        this.defaultScale = new Phaser.Point(x, y || x);
        this.scale.set(x, y);
        this.text.alignIn(this, Phaser.CENTER);
        return this;
    }

    withInputTint(hover: number = 0xcccccc, pressed: number = 0x888888)
    {
        this.hoverTint = hover;
        this.pressedTint = pressed;
        this.inputEnabled = true;

        if (!this.hasHoverTintEvents)
        {
            this.hasHoverTintEvents = true;

            this.events.onInputOver.add(this.handlerOver())

            this.events.onInputDown.add((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, () =>
            {
                this.tint = this.pressedTint;
            }));

            this.events.onInputOut.add((sender, pointer: Phaser.Pointer) =>
            {
                if (!this.input.pointerDown() || pointer.rightButton.isDown)
                {
                    this.tint = NoTintColor;
                }
            })

            this.events.onInputUp.add((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, () =>
            {
                if (isOver)
                {
                    this.tint = this.hoverTint;
                }
                else
                {
                    this.tint = NoTintColor;
                }
            }));
        }

        return this;
    }

    withInputScale(hover = 1.05, pressed = 0.95)
    {
        this.inputEnabled = true;
        this.hoverScale = hover;
        this.pressedScale = pressed;

        if (!this.hasInputScaleEvents)
        {
            this.hasInputScaleEvents = true;

            this.events.onInputOver.add(this.handlerOver())

            this.events.onInputDown.add((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, () =>
            {
                this.game.tweens.removeFrom(this.scale);
                this.game.tweens.removeFrom(this.text.scale);
                this.scale.divide(this.hoverScale, this.hoverScale).multiply(this.pressedScale, this.pressedScale);
                this.text.scale.set(this.pressedScale);
            }));

            this.events.onInputOut.add(() =>
            {
                if (!this.input.pointerDown())
                {
                    this.game.tweens.removeFrom(this.scale);
                    this.game.tweens.removeFrom(this.text.scale);
                    this.scale.set(this.defaultScale.x, this.defaultScale.y);
                    this.text.scale.set(1);
                }
            })

            this.events.onInputUp.add((sender, pointer, isOver) => this.handleInputCallBack(sender, pointer, isOver, () =>
            {
                if (isOver)
                {
                    this.game.tweens.removeFrom(this.scale);
                    this.game.tweens.removeFrom(this.text.scale);
                    this.scale.set(this.defaultScale.x, this.defaultScale.y);
                    this.scale.multiply(this.hoverScale, this.hoverScale);
                    this.text.scale.set(hover);
                }
                else
                {
                    this.scale.set(this.defaultScale.x, this.defaultScale.y);
                    this.text.scale.set(1);
                }
            }), this, 1);
        }

        return this;
    }

    private handleInputCallBack(sender: any, pointer: Phaser.Pointer, isOver: boolean, callBack: Function, context?)
    {
        if (this.canCallBack(pointer))
        {
            callBack.call(context, sender, pointer, isOver);
        }
    }

    public canCallBack(pointer: Phaser.Pointer)
    {
        return (!pointer.isMouse || (pointer.isMouse && pointer.button == Phaser.Mouse.LEFT_BUTTON));
    }

    public handlerOver(): Function
    {
        return () =>
        {
            if (!this.inputEnabled)
            {
                return;
            }
            if (this.game.input.activePointer.isDown)
            {
                return;
            }
            if (this.hoverTint)
            {
                this.tint = this.hoverTint;
            }
            if (this.hoverScale)
            {
                this.game.add.tween(this.scale).to({ x: this.defaultScale.x * this.hoverScale, y: this.defaultScale.y * this.hoverScale }, 100, InOut, true);
                this.game.add.tween(this.text.scale).to({ x: this.hoverScale, y: this.hoverScale }, 100, InOut, true);
            }
            if (this.hoverTextOffset)
            {
                this.text.position.add(this.hoverTextOffset.x, this.hoverTextOffset.y)
            }
        };
    }

    public withTextOffset(normal?: Phaser.Point, hover?: Phaser.Point)
    {
        this.hoverTextOffset = hover || new Phaser.Point(0, 0);;
        normal = normal || new Phaser.Point(0, 0);
        this.defaultTextPosition = this.text.position.add(normal.x, normal.y).clone();
        this.onInputOver.add(this.handlerOver());
        this.onInputOut.add(() =>
        {
            if (!this.game.input.activePointer.isDown)
                this.text.position.subtract(this.hoverTextOffset.x, this.hoverTextOffset.y)
        });
        this.onInputDown.add(() => this.text.position.subtract(this.hoverTextOffset.x * 2, this.hoverTextOffset.y * 2));
        this.onInputUp.add(() => 
        {
            this.text.position.add(this.hoverTextOffset.x, this.hoverTextOffset.y)
            if (this.input.pointerOver())
            {
                this.text.position.add(this.hoverTextOffset.x, this.hoverTextOffset.y)
            }
        });
        return this;
    }

    setActive(active: boolean)
    {
        if (active)
        {
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.text.setStyle(this.textStyleEnabled);
            this.frame = 0;
            this.alpha = 1;
            this.text.alpha = 1;
        }
        else
        {
            this.inputEnabled = false;
            !this.scale.equals(new Phaser.Point(0)) && this.scale.set(this.defaultScale.x, this.defaultScale.y);
            !this.text.scale.equals(new Phaser.Point(0)) && this.text.scale.set(1);
            this.text.setStyle(this.textStyleDisabled);
            this.frame = this.disabledFrame;
            this.alpha = this.disabledAlpha;
            this.text.alpha = this.disabledAlpha;
        }
        this.text.setShadow(this.textStyleEnabled.shadowOffsetX, this.textStyleEnabled.shadowOffsetY, this.textStyleEnabled.shadowColor, this.textStyleEnabled.shadowBlur);
        return this;
    }

    setVisible(visibility: boolean)
    {
        this.visible = visibility;
        this.text.visible = visibility;
        return this;
    }

    configureText(setter: (text: Phaser.Text) => void)
    {
        setter(this.text);
        return this;
    }

    removeKeepDown()
    {
        this.tint = NoTintColor;
        this.frame = 0;
        if (this.hoverTextOffset)
        {
            this.text.position.add(this.hoverTextOffset.x, this.hoverTextOffset.y)
        }
        if (this.pressedScale)
        {
            this.scale.set(this.defaultScale.x, this.defaultScale.y);
        }
    }

    resetTint()
    {
        this.tint = NoTintColor;
    }

    keepDown()
    {
        if (this.pressedTint)
        {
            this.tint = this.pressedTint;
        }
        if (this.downFrame)
        {
            this.frame = this.downFrame;
        }
        if (this.hoverTextOffset)
        {
            this.text.position.subtract(this.hoverTextOffset.x, this.hoverTextOffset.y)
        }
        if (this.pressedScale)
        {
            this.scale.set(this.pressedScale);
        }
        return this;
    }

    startSizingTween(from = 0.95, to = 1.05)
    {
        var defaultScale = this.scale.clone();
        var defaultTextScale = this.text.scale.clone();
        this.scale.set(defaultScale.x * from, defaultScale.y * from);
        this.text.scale.set(defaultTextScale.x * from, defaultTextScale.y * from);
        var tweenButton = this.game.add.tween(this.scale).to({ x: defaultScale.x * to, y: defaultScale.y * to }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
        var tweenText = this.game.add.tween(this.text.scale).to({ x: defaultTextScale.x * to, y: defaultTextScale.y * to }, 300, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);

        tweenButton.onUpdateCallback(stopTweens, this);

        function stopTweens(this: TextButton)
        {
            if (this.input.pointerOver())
            {
                tweenButton.stop();
                tweenText.stop();
                this.handlerOver();
            }
        }
        return this;
    }

    displayFrame(frameNumber: number)
    {
        this.frame = frameNumber;
        return this;
    }

    withName(name: string)
    {
        this.name = name;
        return this;
    }

    alignTo(container: any, position?: number, offsetX?: number, offsetY?: number)
    {
        super.alignTo(container, position, offsetX, offsetY);
        this.text.alignIn(this, Phaser.CENTER);
        return this;
    }

    groupTo(group: Phaser.Group)
    {
        group.add(this);
        return this;
    }
}