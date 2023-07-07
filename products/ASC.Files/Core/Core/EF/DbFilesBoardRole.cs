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

namespace ASC.Files.Core.EF;

public class DbFilesBoardRole : BaseEntity, IDbFile, IMapFrom<BoardRole>
{
    public int TenantId { get; set; }
    public int BoardId { get; set; }
    public int RoleId { get; set; }
    public string RoleTitle { get; set; }
    public string Color { get; set; }
    public int QueueNumber { get; set; }
    public Guid AssignedTo { get; set; }

    public override object[] GetKeys()
    {
        return new object[] { TenantId, BoardId, RoleId };
    }
}

public static class DbFilesBoardRoleExtension
{
    public static ModelBuilderWrapper AddDbFilesBoardRole(this ModelBuilderWrapper modelBuilder)
    {
        modelBuilder
            .Add(MySqlAddDbFilesBoardRole, Provider.MySql)
            .Add(PgSqlAddDbFilesBoardRole, Provider.PostgreSql);

        return modelBuilder;
    }

    public static void MySqlAddDbFilesBoardRole(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DbFilesBoardRole>(entity =>
        {
            entity.HasKey(e => new { e.TenantId, e.BoardId, e.RoleId })
                .HasName("PRIMARY");

            entity.ToTable("files_board_role")
                .HasCharSet("utf8");

            entity.HasIndex(e => e.AssignedTo)
                .HasDatabaseName("assigned_to");

            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.Property(e => e.BoardId).HasColumnName("board_id");

            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.Property(e => e.RoleTitle)
                .HasColumnName("role_title")
                .HasColumnType("varchar(400)")
                .HasCharSet("utf8")
                .UseCollation("utf8_general_ci");

            entity.Property(e => e.Color)
                .HasColumnName("color")
                .HasColumnType("varchar(10)")
                .HasCharSet("utf8")
                .UseCollation("utf8_general_ci");

            entity.Property(e => e.QueueNumber).HasColumnName("queue_number");

            entity.Property(e => e.AssignedTo)
                .HasColumnName("assigned_to")
                .HasColumnType("varchar(38)")
                .HasCharSet("utf8")
                .UseCollation("utf8_general_ci");
        });
    }

    public static void PgSqlAddDbFilesBoardRole(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DbFilesBoardRole>(entity =>
        {
            entity.HasKey(e => new { e.TenantId, e.BoardId, e.RoleId })
                .HasName("files_board_role_pkey");

            entity.ToTable("files_board_role", "onlyoffice");

            entity.HasIndex(e => e.AssignedTo)
                .HasDatabaseName("assigned_to_files_board_role");

            entity.Property(e => e.TenantId).HasColumnName("tenant_id");

            entity.Property(e => e.BoardId).HasColumnName("board_id");

            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.Property(e => e.RoleTitle)
                .HasColumnName("color")
                .HasMaxLength(10)
                .IsFixedLength()
                .HasDefaultValueSql("NULL::bpchar");

            entity.Property(e => e.Color)
                .HasColumnName("role_title")
                .HasMaxLength(400)
                .IsFixedLength()
                .HasDefaultValueSql("NULL::bpchar");

            entity.Property(e => e.QueueNumber).HasColumnName("queue_number");

            entity.Property(e => e.AssignedTo)
                .HasColumnName("assigned_to")
                .HasMaxLength(38)
                .IsFixedLength()
                .HasDefaultValueSql("NULL::bpchar");
        });

    }
}
