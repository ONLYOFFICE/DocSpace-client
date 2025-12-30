// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { BASE_URL } from "../../utils";

export const PATH_OPEN_EDIT = /\/files\/file\/\d+\/openedit(?:\?.*)?$/;

const openEditSuccess = {
  response: {
    document: {
      fileType: "docx",
      info: {
        folder: "My documents",
        owner: "Me",
        sharingSettings: [
          {
            user: "Me",
            permissions: "Full Access",
            isLink: false,
          },
        ],
        type: 1,
        uploaded: "12/23/2025 12:30 AM",
      },
      isLinkedForMe: false,
      key: "nDhAb38C0yAcZvuAzum0j3T9bBgpsywA4kftz6dTOOI_",
      permissions: {
        comment: true,
        chat: true,
        download: true,
        edit: true,
        fillForms: false,
        modifyFilter: true,
        protect: true,
        print: true,
        review: true,
        copy: true,
      },
      referenceData: {
        fileKey: "1",
        instanceId: "1",
        canEditRoom: false,
      },
      title: "ONLYOFFICE Document Sample.docx",
      url: "http://host.docker.internal:80/filehandler.ashx?action=stream&fileid=1&stream_auth=504786297980.JIHU8FUJMOIHCNQ7EBFUYE6KV1PL5FLSX5YNMPKOKLO&origin=http%3a%2f%2f192.168.1.161%3a80",
      isForm: false,
    },
    documentType: "word",
    editorConfig: {
      callbackUrl:
        "http://host.docker.internal:80/filehandler.ashx?action=track&fileid=1&stream_auth=504786297983.E0WGCLMZZWOH4Z5DLRNQY88ZZHJZ5U5JEZPDT9EQK4&request-x-real-ip=172.18.0.1&request-user-agent=Mozilla%2f5.0+(iPhone%3b+CPU+iPhone+OS+18_5+like+Mac+OS+X)+AppleWebKit%2f605.1.15+(KHTML%2c+like+Gecko)+Version%2f18.5+Mobile%2f15E148+Safari%2f604.1&origin=http%3a%2f%2f192.168.1.161%3a80",
      customization: {
        about: true,
        customer: {
          address:
            "20A-6 Ernesta Birznieka-Upisha street, Riga, Latvia, EU, LV-1050",
          logo: `${BASE_URL}/static/images/logo/aboutpage.svg?hash=.`,
          logoDark: `${BASE_URL}/static/images/logo/dark_aboutpage.svg?hash=.`,
          mail: "support@onlyoffice.com",
          name: "Ascensio System SIA",
          www: "https://www.onlyoffice.com",
        },
        anonymous: {
          request: true,
        },
        forcesave: true,
        goback: {
          url: `${BASE_URL}/rooms/personal/filter?folder=7`,
        },
        logo: {
          image: `${BASE_URL}/static/images/logo/docseditor.svg?hash=.`,
          imageDark: `${BASE_URL}/static/images/logo/docseditor.svg?hash=.`,
          imageLight: `${BASE_URL}/static/images/logo/docseditorembed.svg?hash=.`,
          url: `${BASE_URL}/`,
          visible: false,
        },
        mentionShare: true,
      },
      lang: "en-US",
      mode: "edit",
      modeWrite: true,
      plugins: {
        pluginsData: [],
      },
      recent: [],
      templates: [],
      user: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        name: "Administrator ",
        image: `${BASE_URL}/static/images/default_user_photo_size_48-48.png`,
      },
    },
    editorType: 1,
    editorUrl: `${BASE_URL}/ds-vpath?shardkey=nDhAb38C0yAcZvuAzum0j3T9bBgpsywA4kftz6dTOOI_`,
    token:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkb2N1bWVudCI6eyJmaWxlVHlwZSI6ImRvY3giLCJpbmZvIjp7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsIm93bmVyIjoiTWUiLCJzaGFyaW5nU2V0dGluZ3MiOlt7InVzZXIiOiJNZSIsInBlcm1pc3Npb25zIjoiRnVsbCBBY2Nlc3MiLCJpc0xpbmsiOmZhbHNlfV0sInR5cGUiOjEsInVwbG9hZGVkIjoiMTIvMjMvMjAyNSAxMjozMFx1MjAyRkFNIn0sImlzTGlua2VkRm9yTWUiOmZhbHNlLCJrZXkiOiJuRGhBYjM4QzB5QWNadnVBenVtMGozVDliQmdwc3l3QTRrZnR6NmRUT09JXyIsInBlcm1pc3Npb25zIjp7ImNvbW1lbnQiOnRydWUsImNoYXQiOnRydWUsImRvd25sb2FkIjp0cnVlLCJlZGl0Ijp0cnVlLCJmaWxsRm9ybXMiOmZhbHNlLCJtb2RpZnlGaWx0ZXIiOnRydWUsInByb3RlY3QiOnRydWUsInByaW50Ijp0cnVlLCJyZXZpZXciOnRydWUsImNvcHkiOnRydWV9LCJyZWZlcmVuY2VEYXRhIjp7ImZpbGVLZXkiOiIxIiwiaW5zdGFuY2VJZCI6IjEiLCJjYW5FZGl0Um9vbSI6ZmFsc2V9LCJ0aXRsZSI6Ik9OTFlPRkZJQ0UgRG9jdW1lbnQgU2FtcGxlLmRvY3giLCJ1cmwiOiJodHRwOi8vaG9zdC5kb2NrZXIuaW50ZXJuYWw6ODAvZmlsZWhhbmRsZXIuYXNoeD9hY3Rpb249c3RyZWFtXHUwMDI2ZmlsZWlkPTFcdTAwMjZzdHJlYW1fYXV0aD01MDQ3ODYyOTc5ODAuSklIVThGVUpNT0lIQ05RN0VCRlVZRTZLVjFQTDVGTFNYNVlOTVBLT0tMT1x1MDAyNm9yaWdpbj1odHRwJTNhJTJmJTJmMTkyLjE2OC4xLjE2MSUzYTgwIiwiaXNGb3JtIjpmYWxzZX0sImRvY3VtZW50VHlwZSI6IndvcmQiLCJlZGl0b3JDb25maWciOnsiY2FsbGJhY2tVcmwiOiJodHRwOi8vaG9zdC5kb2NrZXIuaW50ZXJuYWw6ODAvZmlsZWhhbmRsZXIuYXNoeD9hY3Rpb249dHJhY2tcdTAwMjZmaWxlaWQ9MVx1MDAyNnN0cmVhbV9hdXRoPTUwNDc4NjI5Nzk4My5FMFdHQ0xNWlpXT0g0WjVETFJOUVk4OFpaSEpaNVU1SkVaUERUOUVRSzRcdTAwMjZyZXF1ZXN0LXgtcmVhbC1pcD0xNzIuMTguMC4xXHUwMDI2cmVxdWVzdC11c2VyLWFnZW50PU1vemlsbGElMmY1LjBcdTAwMkIoaVBob25lJTNiXHUwMDJCQ1BVXHUwMDJCaVBob25lXHUwMDJCT1NcdTAwMkIxOF81XHUwMDJCbGlrZVx1MDAyQk1hY1x1MDAyQk9TXHUwMDJCWClcdTAwMkJBcHBsZVdlYktpdCUyZjYwNS4xLjE1XHUwMDJCKEtIVE1MJTJjXHUwMDJCbGlrZVx1MDAyQkdlY2tvKVx1MDAyQlZlcnNpb24lMmYxOC41XHUwMDJCTW9iaWxlJTJmMTVFMTQ4XHUwMDJCU2FmYXJpJTJmNjA0LjFcdTAwMjZvcmlnaW49aHR0cCUzYSUyZiUyZjE5Mi4xNjguMS4xNjElM2E4MCIsImN1c3RvbWl6YXRpb24iOnsiYWJvdXQiOnRydWUsImN1c3RvbWVyIjp7ImFkZHJlc3MiOiIyMEEtNiBFcm5lc3RhIEJpcnpuaWVrYS1VcGlzaGEgc3RyZWV0LCBSaWdhLCBMYXR2aWEsIEVVLCBMVi0xMDUwIiwibG9nbyI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL3N0YXRpYy9pbWFnZXMvbG9nby9hYm91dHBhZ2Uuc3ZnP2hhc2g9LiIsImxvZ29EYXJrIjoiaHR0cDovLzE5Mi4xNjguMS4xNjEvc3RhdGljL2ltYWdlcy9sb2dvL2RhcmtfYWJvdXRwYWdlLnN2Zz9oYXNoPS4iLCJtYWlsIjoic3VwcG9ydEBvbmx5b2ZmaWNlLmNvbSIsIm5hbWUiOiJBc2NlbnNpbyBTeXN0ZW0gU0lBIiwid3d3IjoiaHR0cHM6Ly93d3cub25seW9mZmljZS5jb20ifSwiYW5vbnltb3VzIjp7InJlcXVlc3QiOnRydWV9LCJmb3JjZXNhdmUiOnRydWUsImdvYmFjayI6eyJ1cmwiOiJodHRwOi8vMTkyLjE2OC4xLjE2MS9yb29tcy9wZXJzb25hbC9maWx0ZXI_Zm9sZGVyPTcifSwibG9nbyI6eyJpbWFnZSI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL3N0YXRpYy9pbWFnZXMvbG9nby9kb2NzZWRpdG9yLnN2Zz9oYXNoPS4iLCJpbWFnZURhcmsiOiJodHRwOi8vMTkyLjE2OC4xLjE2MS9zdGF0aWMvaW1hZ2VzL2xvZ28vZG9jc2VkaXRvci5zdmc_aGFzaD0uIiwiaW1hZ2VMaWdodCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL3N0YXRpYy9pbWFnZXMvbG9nby9kb2NzZWRpdG9yZW1iZWQuc3ZnP2hhc2g9LiIsInVybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxLyIsInZpc2libGUiOmZhbHNlfSwibWVudGlvblNoYXJlIjp0cnVlfSwibGFuZyI6ImVuLVVTIiwibW9kZSI6ImVkaXQiLCJtb2RlV3JpdGUiOnRydWUsInBsdWdpbnMiOnsicGx1Z2luc0RhdGEiOltdfSwicmVjZW50IjpbeyJmb2xkZXIiOiJQdWJsaWMgcm9vbSIsInRpdGxlIjoiTmV3IGRvY3VtZW50LmRvY3giLCJ1cmwiOiJodHRwOi8vMTkyLjE2OC4xLjE2MS9kb2NlZGl0b3I_ZmlsZWlkPTlcdTAwMjZ2ZXJzaW9uPTIifSx7ImZvbGRlciI6Ik15IGRvY3VtZW50cyIsInRpdGxlIjoicGFzcyBkb2MuZG9jeCIsInVybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL2RvY2VkaXRvcj9maWxlaWQ9OFx1MDAyNnZlcnNpb249MiJ9XSwidGVtcGxhdGVzIjpbXSwidXNlciI6eyJpZCI6IjY2ZmFhNmU0LWYxMzMtMTFlYS1iMTI2LTAwZmZlZWM4YjRlZiIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yICIsImltYWdlIjoiaHR0cDovLzE5Mi4xNjguMS4xNjEvc3RhdGljL2ltYWdlcy9kZWZhdWx0X3VzZXJfcGhvdG9fc2l6ZV80OC00OC5wbmcifX0sImVkaXRvclR5cGUiOjEsImVkaXRvclVybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL2RzLXZwYXRoL3dlYi1hcHBzL2FwcHMvYXBpL2RvY3VtZW50cy9hcGkuanM_c2hhcmRrZXk9bkRoQWIzOEMweUFjWnZ1QXp1bTBqM1Q5YkJncHN5d0E0a2Z0ejZkVE9PSV8iLCJmaWxlIjp7ImZvbGRlcklkIjo3LCJ2ZXJzaW9uIjoxLCJ2ZXJzaW9uR3JvdXAiOjEsImNvbnRlbnRMZW5ndGgiOiI0MDAuNzcgS0IiLCJwdXJlQ29udGVudExlbmd0aCI6NDEwMzkwLCJmaWxlU3RhdHVzIjowLCJtdXRlIjpmYWxzZSwidmlld1VybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL2ZpbGVoYW5kbGVyLmFzaHg_YWN0aW9uPWRvd25sb2FkXHUwMDI2ZmlsZWlkPTEiLCJ3ZWJVcmwiOiJodHRwOi8vMTkyLjE2OC4xLjE2MS9kb2NlZGl0b3I_ZmlsZWlkPTFcdTAwMjZ2ZXJzaW9uPTEiLCJmaWxlVHlwZSI6NywiZmlsZUV4c3QiOiIuZG9jeCIsImNvbW1lbnQiOiJDcmVhdGVkIiwidGh1bWJuYWlsU3RhdHVzIjowLCJmb3JtRmlsbGluZ1N0YXR1cyI6MCwidmlld0FjY2Vzc2liaWxpdHkiOnsiSW1hZ2VWaWV3IjpmYWxzZSwiTWVkaWFWaWV3IjpmYWxzZSwiV2ViVmlldyI6dHJ1ZSwiV2ViRWRpdCI6dHJ1ZSwiV2ViUmV2aWV3Ijp0cnVlLCJXZWJDdXN0b21GaWx0ZXJFZGl0aW5nIjpmYWxzZSwiV2ViUmVzdHJpY3RlZEVkaXRpbmciOmZhbHNlLCJXZWJDb21tZW50Ijp0cnVlLCJDYW5Db252ZXJ0Ijp0cnVlLCJNdXN0Q29udmVydCI6ZmFsc2V9LCJsYXN0T3BlbmVkIjoiMjAyNS0xMi0zMFQxMzoxMDo0Ny4wMDAwMDAwXHUwMDJCMDM6MDAiLCJmaWxlRW50cnlUeXBlIjoyLCJpZCI6MSwicm9vdEZvbGRlcklkIjo3LCJjYW5TaGFyZSI6dHJ1ZSwic2hhcmVTZXR0aW5ncyI6eyJFeHRlcm5hbExpbmsiOjZ9LCJzZWN1cml0eSI6eyJSZWFkIjp0cnVlLCJDb21tZW50Ijp0cnVlLCJGaWxsRm9ybXMiOmZhbHNlLCJSZXZpZXciOnRydWUsIkVkaXQiOnRydWUsIkRlbGV0ZSI6dHJ1ZSwiQ3VzdG9tRmlsdGVyIjp0cnVlLCJSZW5hbWUiOnRydWUsIlJlYWRIaXN0b3J5Ijp0cnVlLCJMb2NrIjpmYWxzZSwiRWRpdEhpc3RvcnkiOnRydWUsIkNvcHkiOnRydWUsIk1vdmUiOnRydWUsIkR1cGxpY2F0ZSI6dHJ1ZSwiU3VibWl0VG9Gb3JtR2FsbGVyeSI6dHJ1ZSwiRG93bmxvYWQiOnRydWUsIkNvbnZlcnQiOnRydWUsIkNyZWF0ZVJvb21Gcm9tIjp0cnVlLCJDb3B5TGluayI6dHJ1ZSwiRW1iZWQiOmZhbHNlLCJTdGFydEZpbGxpbmciOmZhbHNlLCJGaWxsaW5nU3RhdHVzIjpmYWxzZSwiUmVzZXRGaWxsaW5nIjpmYWxzZSwiU3RvcEZpbGxpbmciOmZhbHNlLCJPcGVuRm9ybSI6dHJ1ZSwiVmVjdG9yaXphdGlvbiI6ZmFsc2UsIkFza0FpIjpmYWxzZX0sImF2YWlsYWJsZVNoYXJlUmlnaHRzIjp7IlVzZXIiOlsiUmVhZFdyaXRlIiwiRWRpdGluZyIsIlJldmlldyIsIkNvbW1lbnQiLCJSZWFkIiwiUmVzdHJpY3QiLCJOb25lIl0sIkV4dGVybmFsTGluayI6WyJFZGl0aW5nIiwiUmV2aWV3IiwiQ29tbWVudCIsIlJlYWQiLCJOb25lIl0sIkdyb3VwIjpbIlJlYWRXcml0ZSIsIkVkaXRpbmciLCJSZXZpZXciLCJDb21tZW50IiwiUmVhZCIsIlJlc3RyaWN0IiwiTm9uZSJdLCJQcmltYXJ5RXh0ZXJuYWxMaW5rIjpbIkVkaXRpbmciLCJSZXZpZXciLCJDb21tZW50IiwiUmVhZCIsIk5vbmUiXX0sInRpdGxlIjoiT05MWU9GRklDRSBEb2N1bWVudCBTYW1wbGUuZG9jeCIsImFjY2VzcyI6MCwic2hhcmVkIjpmYWxzZSwic2hhcmVkRm9yVXNlciI6ZmFsc2UsInBhcmVudFNoYXJlZCI6ZmFsc2UsInNob3J0V2ViVXJsIjoiIiwiY3JlYXRlZCI6IjIwMjUtMTItMjNUMDA6MzA6MDguMDAwMDAwMFx1MDAyQjAzOjAwIiwiY3JlYXRlZEJ5Ijp7ImlkIjoiNjZmYWE2ZTQtZjEzMy0xMWVhLWIxMjYtMDBmZmVlYzhiNGVmIiwiZGlzcGxheU5hbWUiOiJBZG1pbmlzdHJhdG9yICIsImF2YXRhciI6Ii9zdGF0aWMvaW1hZ2VzL2RlZmF1bHRfdXNlcl9waG90b19zaXplXzgyLTgyLnBuZz9oYXNoPTg2ODk5NjY0MSIsImF2YXRhck9yaWdpbmFsIjoiL3N0YXRpYy9pbWFnZXMvZGVmYXVsdF91c2VyX3Bob3RvX3NpemVfMjAwLTIwMC5wbmc_aGFzaD04Njg5OTY2NDEiLCJhdmF0YXJNYXgiOiIvc3RhdGljL2ltYWdlcy9kZWZhdWx0X3VzZXJfcGhvdG9fc2l6ZV8yMDAtMjAwLnBuZz9oYXNoPTg2ODk5NjY0MSIsImF2YXRhck1lZGl1bSI6Ii9zdGF0aWMvaW1hZ2VzL2RlZmF1bHRfdXNlcl9waG90b19zaXplXzQ4LTQ4LnBuZz9oYXNoPTg2ODk5NjY0MSIsImF2YXRhclNtYWxsIjoiL3N0YXRpYy9pbWFnZXMvZGVmYXVsdF91c2VyX3Bob3RvX3NpemVfMzItMzIucG5nP2hhc2g9ODY4OTk2NjQxIiwicHJvZmlsZVVybCI6Imh0dHA6Ly8xOTIuMTY4LjEuMTYxL2FjY291bnRzL3Blb3BsZS9maWx0ZXI_c2VhcmNoPXZpa3Rvci5mb21pbiU0MG9ubHlvZmZpY2UuY29tIiwiaGFzQXZhdGFyIjpmYWxzZSwiaXNBbm9uaW0iOmZhbHNlfSwidXBkYXRlZCI6IjIwMjUtMTItMjNUMDA6MzA6MDguMDAwMDAwMFx1MDAyQjAzOjAwIiwicm9vdEZvbGRlclR5cGUiOjUsInVwZGF0ZWRCeSI6eyJpZCI6IjY2ZmFhNmU0LWYxMzMtMTFlYS1iMTI2LTAwZmZlZWM4YjRlZiIsImRpc3BsYXlOYW1lIjoiQWRtaW5pc3RyYXRvciAiLCJhdmF0YXIiOiIvc3RhdGljL2ltYWdlcy9kZWZhdWx0X3VzZXJfcGhvdG9fc2l6ZV84Mi04Mi5wbmc_aGFzaD04Njg5OTY2NDEiLCJhdmF0YXJPcmlnaW5hbCI6Ii9zdGF0aWMvaW1hZ2VzL2RlZmF1bHRfdXNlcl9waG90b19zaXplXzIwMC0yMDAucG5nP2hhc2g9ODY4OTk2NjQxIiwiYXZhdGFyTWF4IjoiL3N0YXRpYy9pbWFnZXMvZGVmYXVsdF91c2VyX3Bob3RvX3NpemVfMjAwLTIwMC5wbmc_aGFzaD04Njg5OTY2NDEiLCJhdmF0YXJNZWRpdW0iOiIvc3RhdGljL2ltYWdlcy9kZWZhdWx0X3VzZXJfcGhvdG9fc2l6ZV80OC00OC5wbmc_aGFzaD04Njg5OTY2NDEiLCJhdmF0YXJTbWFsbCI6Ii9zdGF0aWMvaW1hZ2VzL2RlZmF1bHRfdXNlcl9waG90b19zaXplXzMyLTMyLnBuZz9oYXNoPTg2ODk5NjY0MSIsInByb2ZpbGVVcmwiOiJodHRwOi8vMTkyLjE2OC4xLjE2MS9hY2NvdW50cy9wZW9wbGUvZmlsdGVyP3NlYXJjaD12aWt0b3IuZm9taW4lNDBvbmx5b2ZmaWNlLmNvbSIsImhhc0F2YXRhciI6ZmFsc2UsImlzQW5vbmltIjpmYWxzZX19LCJzdGFydEZpbGxpbmdNb2RlIjowfQ.dcSFSFcw1G5xBeN-AtAzalTNa9DrKE-SWzwg2V1uAb4",
    type: "mobile",
    file: {
      folderId: 7,
      version: 1,
      versionGroup: 1,
      contentLength: "400.77 KB",
      pureContentLength: 410390,
      fileStatus: 0,
      mute: false,
      viewUrl: `${BASE_URL}/filehandler.ashx?action=download&fileid=1`,
      webUrl: `${BASE_URL}/doceditor?fileid=1&version=1`,
      fileType: 7,
      fileExst: ".docx",
      comment: "Created",
      thumbnailStatus: 0,
      formFillingStatus: 0,
      viewAccessibility: {
        ImageView: false,
        MediaView: false,
        WebView: true,
        WebEdit: true,
        WebReview: true,
        WebCustomFilterEditing: false,
        WebRestrictedEditing: false,
        WebComment: true,
        CanConvert: true,
        MustConvert: false,
      },
      lastOpened: "2025-12-30T13:10:47.0000000+03:00",
      fileEntryType: 2,
      id: 1,
      rootFolderId: 7,
      canShare: true,
      shareSettings: {
        ExternalLink: 6,
      },
      security: {
        Read: true,
        Comment: true,
        FillForms: false,
        Review: true,
        Edit: true,
        Delete: true,
        CustomFilter: true,
        Rename: true,
        ReadHistory: true,
        Lock: false,
        EditHistory: true,
        Copy: true,
        Move: true,
        Duplicate: true,
        SubmitToFormGallery: true,
        Download: true,
        Convert: true,
        CreateRoomFrom: true,
        CopyLink: true,
        Embed: false,
        StartFilling: false,
        FillingStatus: false,
        ResetFilling: false,
        StopFilling: false,
        OpenForm: true,
        Vectorization: false,
        AskAi: false,
      },
      availableShareRights: {
        User: [
          "ReadWrite",
          "Editing",
          "Review",
          "Comment",
          "Read",
          "Restrict",
          "None",
        ],
        ExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
        Group: [
          "ReadWrite",
          "Editing",
          "Review",
          "Comment",
          "Read",
          "Restrict",
          "None",
        ],
        PrimaryExternalLink: ["Editing", "Review", "Comment", "Read", "None"],
      },
      title: "ONLYOFFICE Document Sample.docx",
      access: 0,
      shared: false,
      sharedForUser: false,
      parentShared: false,
      shortWebUrl: "",
      created: "2025-12-23T00:30:08.0000000+03:00",
      createdBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=868996641",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=868996641",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=868996641",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
      updated: "2025-12-23T00:30:08.0000000+03:00",
      rootFolderType: 5,
      updatedBy: {
        id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        displayName: "Administrator",
        avatar:
          "/static/images/default_user_photo_size_82-82.png?hash=868996641",
        avatarOriginal:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMax:
          "/static/images/default_user_photo_size_200-200.png?hash=868996641",
        avatarMedium:
          "/static/images/default_user_photo_size_48-48.png?hash=868996641",
        avatarSmall:
          "/static/images/default_user_photo_size_32-32.png?hash=868996641",
        profileUrl: "",
        hasAvatar: false,
        isAnonim: false,
      },
    },
    startFillingMode: 0,
  },
  status: 0,
  statusCode: 200,
};

export const openEditHandler = () => {
  return new Response(JSON.stringify(openEditSuccess));
};
