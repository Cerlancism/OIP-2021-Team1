export function pointLerp(from: Phaser.Point, x: number, y: number, t: number)
{
    return new Phaser.Point(
        from.x + (x - from.x) * t,
        from.y + (y - from.y) * t
    );
}