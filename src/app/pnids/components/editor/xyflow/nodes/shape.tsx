import { SVGAttributes } from 'react';

function Circle({ width, height, ...svgAttributes }: ShapeProps) {
    return (
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        {...svgAttributes}
      />
    );
}

function Rectangle({ width, height, ...svgAttributes }: ShapeProps) {
    return <rect x={0} y={0} width={width} height={height} {...svgAttributes} />;
}

// here we register all the shapes that are available
// you can add your own here
const ShapeComponents = {
  circle: Circle,
  rectangle: Rectangle,
};

type ShapeType = keyof typeof ShapeComponents;

type ShapeProps = {
    width: number;
    height: number;
} & SVGAttributes<SVGElement>;

type ShapeComponentProps = Partial<ShapeProps> & { type: ShapeType };

export default function Shape({ type, width, height, ...svgAttributes }: ShapeComponentProps) {
    const ShapeComponent = ShapeComponents[type];
    if (!ShapeComponent || !width || !height) {
        return null;
    }

    const strokeWidth = svgAttributes.strokeWidth
    ? +svgAttributes.strokeWidth
    : 0;

    const innerWidth = width - 2 * strokeWidth;
    const innerHeight = height - 2 * strokeWidth;

    return (
        <svg width={width} height={height} className='shape-svg'>
          {/* this offsets the shape by the strokeWidth so that we have enough space for the stroke */}
          <g
            transform={`translate(${svgAttributes.strokeWidth ?? 0}, ${
              svgAttributes.strokeWidth ?? 0
            })`}
          >
            <ShapeComponent
              width={innerWidth}
              height={innerHeight}
              {...svgAttributes}
            />
          </g>
        </svg>
      );
}