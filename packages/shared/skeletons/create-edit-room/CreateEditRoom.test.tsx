import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import CreateEditRoomDilogHeaderLoader from "./DilogHeader";
import RoomTypeListLoader from "./RoomTypeList";
import SetRoomParamsLoader from "./SetRoomParams";

describe("CreateEditRoom Skeleton Components", () => {
  describe("CreateEditRoomDilogHeaderLoader", () => {
    it("renders without crashing", () => {
      render(<CreateEditRoomDilogHeaderLoader />);
      const skeletonElement = screen.getByTestId("rectangle-skeleton");
      expect(skeletonElement).toBeInTheDocument();
      expect(skeletonElement).toHaveAttribute("width", "250");
      expect(skeletonElement).toHaveAttribute("height", "21");
    });
  });

  describe("RoomTypeListLoader", () => {
    it("renders without crashing", () => {
      render(<RoomTypeListLoader />);
      const skeletonElements = screen.getAllByTestId("rectangle-skeleton");
      expect(skeletonElements).toHaveLength(5);

      skeletonElements.forEach((element) => {
        expect(element).toBeInTheDocument();
        expect(element).toHaveAttribute("width", "100%");
        expect(element).toHaveAttribute("height", "86");
      });
    });
  });

  describe("SetRoomParamsLoader", () => {
    it("renders without crashing", () => {
      render(<SetRoomParamsLoader />);
      const skeletonElements = screen.getAllByTestId("rectangle-skeleton");
      expect(skeletonElements).toHaveLength(5);

      // First skeleton - main input
      expect(skeletonElements[0]).toHaveAttribute("width", "100%");
      expect(skeletonElements[0]).toHaveAttribute("height", "86");

      // Second skeleton - secondary input
      expect(skeletonElements[1]).toHaveAttribute("width", "100%");
      expect(skeletonElements[1]).toHaveAttribute("height", "53.6");

      // Tag input section
      expect(skeletonElements[2]).toHaveAttribute("width", "100%");
      expect(skeletonElements[2]).toHaveAttribute("height", "53.6");
      expect(skeletonElements[3]).toHaveAttribute("width", "84");
      expect(skeletonElements[3]).toHaveAttribute("height", "32");

      // Last skeleton - text area
      expect(skeletonElements[4]).toHaveAttribute("width", "100%");
      expect(skeletonElements[4]).toHaveAttribute("height", "146");
    });
  });
});
