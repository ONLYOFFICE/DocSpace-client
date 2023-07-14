using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASC.Migrations.PostgreSql.Migrations.FilesDb
{
    /// <inheritdoc />
    public partial class FilesDbContextUpgrade1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "files_board_role",
                schema: "onlyoffice",
                columns: table => new
                {
                    tenantid = table.Column<int>(name: "tenant_id", type: "integer", nullable: false),
                    boardid = table.Column<int>(name: "board_id", type: "integer", nullable: false),
                    roleid = table.Column<int>(name: "role_id", type: "integer", nullable: false),
                    tagid = table.Column<int>(name: "tag_id", type: "integer", nullable: false),
                    color = table.Column<string>(type: "character(10)", fixedLength: true, maxLength: 10, nullable: true, defaultValueSql: "NULL::bpchar"),
                    roletitle = table.Column<string>(name: "role_title", type: "character(400)", fixedLength: true, maxLength: 400, nullable: true, defaultValueSql: "NULL::bpchar"),
                    queuenumber = table.Column<int>(name: "queue_number", type: "integer", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    assignedto = table.Column<Guid>(name: "assigned_to", type: "uuid", fixedLength: true, maxLength: 38, nullable: false, defaultValueSql: "NULL::bpchar")
                },
                constraints: table =>
                {
                    table.PrimaryKey("files_board_role_pkey", x => new { x.tenantid, x.boardid, x.roleid });
                });

            migrationBuilder.CreateIndex(
                name: "assigned_to_files_board_role",
                schema: "onlyoffice",
                table: "files_board_role",
                column: "assigned_to");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "files_board_role",
                schema: "onlyoffice");
        }
    }
}
