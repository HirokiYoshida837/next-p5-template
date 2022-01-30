import React from "react";
import p5Types from "p5";

import { SketchTemplate } from "@/sketchTemplate";
import {
  createAttractor,
  createNode,
  PointObj,
} from "@/sketches/MySketch4/types/Point";
import { randomBetween } from "@/util/RandomUtils";

/**
 * sample sketch for complex logics </br>
 *
 * @constructor
 */
export const MySketch4: React.FC = () => {
  const setUp = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(canvasSize.x, canvasSize.y).parent(canvasParentRef);
    p5.frameRate(10);

    // seed固定
    p5.randomSeed(100);

    for (let i = 0; i < 3000; i++) {
      const attractor = createAttractor({
        index: i,
        posX: randomBetween(p5, 0, canvasSize.x),
        posY: randomBetween(p5, 0, canvasSize.y),
      });
      attractors.push(attractor);
    }

    // nodeの初期位置は自分で指定する。
    nodes.push(createNode({ index: 2002, posX: 250, posY: 250 }));
    nodes.push(createNode({ index: 2003, posX: 800, posY: 400 }));
    nodes.push(createNode({ index: 2003, posX: 700, posY: 900 }));
  };

  const draw = (p5: p5Types) => {
    p5.background(0);

    nodes = nodes.map((x) => {
      x.associates = new Array<number>();
      return x;
    });

    // node側に、一番近いattracorsのリストを設定
    attractors.forEach((item, index) => {
      const nearestNodeIndex = searchNearestNode(
        p5,
        item.posX,
        item.posY,
        nodes,
        infrad
      );
      if (nearestNodeIndex >= 0) {
        nodes[nearestNodeIndex].associates.push(index);
      }
    });

    nodes.forEach((item) => {
      if (item.associates.length <= 0) {
        return;
      }

      let vector = p5.createVector();

      item.associates.forEach((x) => {
        let pointObj = attractors[x];

        const target = p5.createVector(pointObj.posX, pointObj.posY);
        const from = p5.createVector(item.posX, item.posY);
        const diff = target.sub(from);

        const normalizedDir = diff.normalize();

        vector = vector.add(normalizedDir);
      });

      vector = vector.normalize();

      nodes.push(
        createNode({
          index: 2003,
          posX: item.posX + vector.x * rad,
          posY: item.posY + vector.y * rad,
        })
      );
    });

    const willDeleteList = nodes.map((item) => {
      return searchNears(p5, item.posX, item.posY, attractors, killrad);
    });
    const d = new Array<number>().concat(...(willDeleteList as any));
    const willDelete = Array.from(new Set(d));

    attractors = attractors.filter((val, index) => {
      return !willDelete.includes(index);
    });

    for (let attractor of attractors) {
      attractor.draw(p5);
    }

    for (let node of nodes) {
      node.draw(p5);
    }
  };

  return (
    <>
      <SketchTemplate setup={setUp} draw={draw} />
    </>
  );
};

const canvasSize = {
  x: 1000,
  y: 1000,
};

const infrad = 50;

const rad = 10;
const killrad = 25;

let attractors = new Array<PointObj>();

let nodes = new Array<PointObj>();

/**
 * 一番近いNodeを探します。
 * @param p5
 * @param posX
 * @param posY
 * @param nodes
 * @param infrad
 */
const searchNearestNode = (
  p5: p5Types,
  posX: number,
  posY: number,
  nodes: Array<PointObj>,
  infrad?: number
): number => {
  let nearestIndex = -1;
  let minDist = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < nodes.length; i++) {
    const d = p5.dist(posX, posY, nodes[i].posX, nodes[i].posY);

    if (minDist > d) {
      nearestIndex = i;
      minDist = d;
    }
  }

  if (infrad) {
    if (minDist > infrad) {
      return -1;
    } else {
      return nearestIndex;
    }
  } else {
    return nearestIndex;
  }
};

const searchNears = (
  p5: p5Types,
  posX: number,
  posY: number,
  nodes: Array<PointObj>,
  killrad: number
) => {
  const nearIndexes = new Array<number>();

  for (let i = 0; i < nodes.length; i++) {
    const d = p5.dist(posX, posY, nodes[i].posX, nodes[i].posY);
    if (d < killrad) {
      nearIndexes.push(i);
    }
  }

  return nearIndexes;
};
