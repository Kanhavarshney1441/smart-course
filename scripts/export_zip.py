import os
import zipfile

def make_zip(output_filename="smart_course_recommendation_system.zip"):
    exclude_dirs = {
        "node_modules", ".git", "dist", ".playwright-cli", "__pycache__", ".pytest_cache"
    }
    exclude_files = {
        output_filename, "database.sqlite", "course_recommender.db", "test_temp.db"
    }

    print(f"Creating zip archive: {output_filename}...")
    count = 0
    with zipfile.ZipFile(output_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # filter out excluded dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".playwright")]
            for file in files:
                if file in exclude_files or file.endswith(".pyc") or file.endswith(".log"):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, ".")
                zipf.write(file_path, arcname)
                count += 1

    print(f"Archive created successfully with {count} files: {output_filename}")

if __name__ == "__main__":
    make_zip()
