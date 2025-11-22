using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TimetableAPI.Models;

public partial class TimetableDbContext : DbContext
{
    public TimetableDbContext()
    {
    }

    public TimetableDbContext(DbContextOptions<TimetableDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<StudentElectiveChoice> StudentElectiveChoices { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<TimeSlot> TimeSlots { get; set; }

    public virtual DbSet<Timetable> Timetables { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=LAPTOP-8FUTNMGR\\SQLEXPRESS;Database=TimetableDB;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.FacultyId).HasName("PK__Faculty__7B00413C8AE56FEB");

            entity.ToTable("Faculty");

            entity.Property(e => e.FacultyId).HasColumnName("faculty_id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");

            entity.HasMany(d => d.Subjects).WithMany(p => p.Faculties)
                .UsingEntity<Dictionary<string, object>>(
                    "FacultySubject",
                    r => r.HasOne<Subject>().WithMany()
                        .HasForeignKey("SubjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Faculty_S__subje__5EBF139D"),
                    l => l.HasOne<Faculty>().WithMany()
                        .HasForeignKey("FacultyId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Faculty_S__facul__5DCAEF64"),
                    j =>
                    {
                        j.HasKey("FacultyId", "SubjectId").HasName("PK__Faculty___6E000E5A0CC684E0");
                        j.ToTable("Faculty_Subjects");
                        j.IndexerProperty<int>("FacultyId").HasColumnName("faculty_id");
                        j.IndexerProperty<int>("SubjectId").HasColumnName("subject_id");
                    });
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__Rooms__19675A8A757BDDB2");

            entity.HasIndex(e => e.RoomNumber, "UQ__Rooms__FE22F61BC1A2A0EF").IsUnique();

            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.RoomNumber)
                .HasMaxLength(20)
                .HasColumnName("room_number");
            entity.Property(e => e.RoomType)
                .HasMaxLength(50)
                .HasColumnName("room_type");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__Students__2A33069A639536DB");

            entity.HasIndex(e => e.EnrollmentNo, "UQ__Students__6D2483182E29FEFE").IsUnique();

            entity.Property(e => e.StudentId).HasColumnName("student_id");
            //entity.Property(e => e.DivisionCode)
            //    .HasMaxLength(10)
            //    .HasColumnName("division_code");
            entity.Property(e => e.EnrollmentNo)
                .HasMaxLength(20)
                .HasColumnName("enrollment_no");
            //entity.Property(e => e.LabBatch).HasColumnName("lab_batch");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<StudentElectiveChoice>(entity =>
        {
            entity.HasKey(e => e.ChoiceId).HasName("PK__Student___33CAF83A56FDBE41");

            entity.ToTable("Student_Elective_Choices");

            entity.HasIndex(e => new { e.StudentId, e.SubjectId }, "UQ__Student___3F3349FD363765DE").IsUnique();

            entity.Property(e => e.ChoiceId).HasColumnName("choice_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentElectiveChoices)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__Student_E__stude__59FA5E80");

            entity.HasOne(d => d.Subject).WithMany(p => p.StudentElectiveChoices)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__Student_E__subje__5AEE82B9");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.SubjectId).HasName("PK__Subjects__5004F660D8DE0ACD");

            entity.HasIndex(e => e.SubjectCode, "UQ__Subjects__CEACD9203B48D034").IsUnique();

            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.RequiresLab).HasColumnName("requires_lab");
            entity.Property(e => e.SubjectCode)
                .HasMaxLength(20)
                .HasColumnName("subject_code");
            entity.Property(e => e.SubjectName)
                .HasMaxLength(100)
                .HasColumnName("subject_name");
            entity.Property(e => e.SubjectType)
                .HasMaxLength(50)
                .HasColumnName("subject_type");
        });

        modelBuilder.Entity<TimeSlot>(entity =>
        {
            entity.HasKey(e => e.SlotId).HasName("PK__Time_Slo__971A01BBD70E034B");

            entity.ToTable("Time_Slots");

            entity.Property(e => e.SlotId).HasColumnName("slot_id");
            entity.Property(e => e.DayOfWeek)
                .HasMaxLength(10)
                .HasColumnName("day_of_week");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
        });

        modelBuilder.Entity<Timetable>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__Timetabl__FDF47986CA2F29C3");

            entity.ToTable("Timetable");

            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.FacultyId).HasColumnName("faculty_id");
            entity.Property(e => e.GroupName)
                .HasMaxLength(50)
                .HasColumnName("group_name");
            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.SlotId).HasColumnName("slot_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");

            entity.HasOne(d => d.Faculty).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.FacultyId)
                .HasConstraintName("FK__Timetable__facul__628FA481");

            entity.HasOne(d => d.Room).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__Timetable__room___6383C8BA");

            entity.HasOne(d => d.Slot).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.SlotId)
                .HasConstraintName("FK__Timetable__slot___6477ECF3");

            entity.HasOne(d => d.Subject).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.SubjectId)
                .HasConstraintName("FK__Timetable__subje__619B8048");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


}
