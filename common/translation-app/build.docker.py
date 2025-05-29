# (c) Copyright Ascensio System SIA 2009-2025
#
# This program is a free software product.
# You can redistribute it and/or modify it under the terms
# of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
# Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
# to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
# any third-party rights.
#
# This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
# of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
# the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
#
# You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
#
# The  interactive user interfaces in modified source and object code versions of the Program must
# display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
#
# Pursuant to Section 7(b) of the License you must retain the original Product logo when
# distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
# trademark law for use of our trademarks.
#
# All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
# content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
# International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import os
import subprocess

rd = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(rd,  "frontend"))
backend_dir = os.path.abspath(os.path.join(rd, "backend"))
test_dir = os.path.abspath(os.path.join(rd, "..", "tests"))
docspace_dir = os.path.abspath(os.path.join(rd, "..", "..", ".."))

# Install backend dependencies
print(f"Installing backend dependencies: {backend_dir}")
backend_install = subprocess.run("npm install", cwd=backend_dir, shell=True)
if backend_install.returncode != 0:
    print("Failed to install backend dependencies")
    exit(1)

# Install frontend dependencies
print(f"Installing frontend dependencies: {frontend_dir}")
frontend_install = subprocess.run("npm install", cwd=frontend_dir, shell=True)
if frontend_install.returncode != 0:
    print("Failed to install frontend dependencies")
    exit(1)

# Install tests dependencies - important for translation validation
print(f"Installing tests dependencies: {test_dir}")
test_install = subprocess.run("npm install", cwd=test_dir, shell=True)
if test_install.returncode != 0:
    print("Failed to install tests dependencies")
    exit(1)

# Start Docker Compose
print("Starting Docker Compose...")
os.environ["OLLAMA_API_URL"] = "http://host.docker.internal:11434"
docker_compose = subprocess.run(
    "docker-compose up -d --build", cwd=rd, shell=True)
if docker_compose.returncode != 0:
    print("Failed to start Docker Compose")
    exit(1)

print("\nTranslation Management App is now running!")
print("Frontend: http://localhost:3000")
print("Backend: http://localhost:3001")
