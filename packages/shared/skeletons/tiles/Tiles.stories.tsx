import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { TilesSkeleton } from "./Tiles";
import { TileSkeleton } from "./Tile";
import type { TilesSkeletonProps, TileSkeletonProps } from "./Tiles.types";

export default {
  title: "Skeletons/Tiles",
  component: TilesSkeleton,
} as Meta;

const TilesTemplate: StoryFn<TilesSkeletonProps> = (args) => (
  <TilesSkeleton {...args} />
);

export const Default = TilesTemplate.bind({});
Default.args = {};

export const NoFolders = TilesTemplate.bind({});
NoFolders.args = {
  foldersCount: 0,
  filesCount: 5,
};

export const NoFiles = TilesTemplate.bind({});
NoFiles.args = {
  foldersCount: 3,
  filesCount: 0,
};

export const WithoutTitle = TilesTemplate.bind({});
WithoutTitle.args = {
  withTitle: false,
};

const TileTemplate: StoryFn<TileSkeletonProps> = (args) => (
  <TileSkeleton {...args} />
);

export const SingleFolder = TileTemplate.bind({});
SingleFolder.args = {
  isFolder: true,
};

export const SingleFile = TileTemplate.bind({});
SingleFile.args = {
  isFolder: false,
};

export const SingleRoom = TileTemplate.bind({});
SingleRoom.args = {
  isRoom: true,
};
