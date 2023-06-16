// (c) Copyright Ascensio System SIA 2010-2022
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

namespace ASC.Files.Core.ApiModels.ResponseDto;
public class FileRoleDto
{
    public FileRoleDto() { }

    public int Id { get; set; }
    public string Title { get; set; }
    public string Color { get; set; }
    public EmployeeDto Assigned { get; set; }
    public List<FormFillingStep> FormFillingSteps { get; set; }

}

public class FormFillingStep
{
    public FormFillingStep() { }
    public FormFilingStatusType FormFilingStatusType { get; set; }
    public DateTime Date { get; set; }
    public string Comment { get; set; }

}

[Scope]
public class FileRoleDtoHelper
{

    public FileRoleDtoHelper()
    {
       
    }

    public async Task<List<FileRoleDto>> GetAsync<T>(File<T> file)
    {

        //TODO get roles from file

        var mockResult = new List<FileRoleDto>() {

            new FileRoleDto() {Id = 1, Title = "everyone", Color = "fbcc86", Assigned = new EmployeeDto(){
                Id = Guid.Parse("a7b9d5de-fe74-499f-b982-8566252c7cf8"),
                DisplayName = "Administrator",
                AvatarSmall = "/static/images/default_user_photo_size_32-32.png",
                ProfileUrl = "http://localhost:8092/accounts/view/administrator",
                HasAvatar = false
            },
                FormFillingSteps = new List<FormFillingStep>()
                {
                    new FormFillingStep()
                    {
                        FormFilingStatusType = FormFilingStatusType.StartedFilling,
                        Date = DateTime.Now.AddDays(-5),
                    },
                    new FormFillingStep()
                    {
                        FormFilingStatusType = FormFilingStatusType.FilledAndSigned,
                        Date = DateTime.Now.AddDays(-1),
                        Comment = "I agree with everything"
                    }
                }
            },
            new FileRoleDto() {Id = 2, Title = "accountant",Color = "70d3b0", Assigned = new EmployeeDto(){
                Id = Guid.Parse("a4d05126-d7e1-4e93-9cdd-51d9c149090d"),
                DisplayName = "Madelyn Septimus",
                AvatarSmall = "/static/images/default_user_photo_size_32-32.png",
                ProfileUrl = "http://localhost:8092/accounts/view/madelyn.septimus",
                HasAvatar = false
            },
                FormFillingSteps = new List<FormFillingStep>()
                {
                    new FormFillingStep()
                    {
                        FormFilingStatusType = FormFilingStatusType.StartedFilling,
                        Date = DateTime.Now.AddHours(-3),
                    }
                }
            },
            new FileRoleDto() {Id = 3, Title = "director", Color = "bb85e7", Assigned = new EmployeeDto(){
                Id = Guid.Parse("33e27954-303e-4757-8efd-597d3d2a9f7e"),
                DisplayName = "Mark Bellos",
                AvatarSmall = "/static/images/default_user_photo_size_32-32.png",
                ProfileUrl = "http://localhost:8092/accounts/view/mark.bellos",
                HasAvatar = false
            },
                FormFillingSteps = new List<FormFillingStep>(){ }
            },
        };

        return mockResult;
    }
}
