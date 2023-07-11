using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASC.Migrations.MySql.Migrations.FilesDb
{
    /// <inheritdoc />
    public partial class FilesDbContextUpgrade1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "files_board_role",
                columns: table => new
                {
                    tenantid = table.Column<int>(name: "tenant_id", type: "int", nullable: false),
                    boardid = table.Column<int>(name: "board_id", type: "int", nullable: false),
                    roleid = table.Column<int>(name: "role_id", type: "int", nullable: false),
                    roletitle = table.Column<string>(name: "role_title", type: "varchar(400)", nullable: true, collation: "utf8_general_ci")
                        .Annotation("MySql:CharSet", "utf8"),
                    color = table.Column<string>(type: "varchar(10)", nullable: true, collation: "utf8_general_ci")
                        .Annotation("MySql:CharSet", "utf8"),
                    queuenumber = table.Column<int>(name: "queue_number", type: "int", nullable: false),
                    type = table.Column<int>(type: "int", nullable: false),
                    assignedto = table.Column<string>(name: "assigned_to", type: "varchar(38)", nullable: false, collation: "utf8_general_ci")
                        .Annotation("MySql:CharSet", "utf8")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => new { x.tenantid, x.boardid, x.roleid });
                })
                .Annotation("MySql:CharSet", "utf8");

            migrationBuilder.CreateIndex(
                name: "assigned_to",
                table: "files_board_role",
                column: "assigned_to");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "files_board_role");
        }
    }
}
