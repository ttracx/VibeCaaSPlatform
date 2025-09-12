#!/usr/bin/env python3
"""
Replit to NVIDIA Cloud Migration Analyzer
Analyzes Replit applications and generates migration requirements for NVIDIA Cloud platforms
"""

import os
import json
import yaml
import ast
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
import argparse

@dataclass
class AppRequirements:
    """Data class for application requirements"""
    language: str
    framework: Optional[str]
    dependencies: List[str]
    gpu_required: bool
    gpu_libraries: List[str]
    estimated_cpu: str
    estimated_ram: str
    estimated_gpu_ram: str
    storage_size: str
    exposed_ports: List[int]
    environment_vars: List[str]
    database_type: Optional[str]
    container_base_image: str
    nvidia_platform_recommendation: str

class ReplitMigrationAnalyzer:
    """Analyzes Replit projects for NVIDIA Cloud migration"""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.requirements = None
        self.analysis_results = {}
        
        # GPU-accelerated libraries
        self.gpu_libraries = {
            'python': [
                'tensorflow', 'torch', 'pytorch', 'jax', 'cupy', 'rapids',
                'numba', 'pycuda', 'tensorrt', 'triton', 'transformers',
                'opencv-python-headless', 'dgl', 'horovod', 'apex'
            ],
            'node': ['@tensorflow/tfjs-node-gpu', 'gpu.js'],
            'cpp': ['cuda', 'cudnn', 'tensorrt', 'nccl'],
        }
        
        # Framework detection patterns
        self.frameworks = {
            'python': {
                'flask': ['flask', 'Flask(__name__)'],
                'django': ['django', 'manage.py'],
                'fastapi': ['fastapi', 'FastAPI()'],
                'streamlit': ['streamlit', 'st.'],
                'gradio': ['gradio', 'gr.'],
                'pytorch': ['torch', 'pytorch'],
                'tensorflow': ['tensorflow', 'tf.'],
            },
            'node': {
                'express': ['express', 'app.listen'],
                'nextjs': ['next', 'next.config'],
                'react': ['react', 'ReactDOM'],
                'vue': ['vue', 'Vue('],
            }
        }
    
    def analyze(self) -> Dict[str, Any]:
        """Main analysis method"""
        print(f"🔍 Analyzing Replit project at: {self.project_path}")
        
        # Detect language and framework
        language = self.detect_language()
        framework = self.detect_framework(language)
        
        # Analyze dependencies
        dependencies = self.get_dependencies(language)
        gpu_libs = self.detect_gpu_libraries(dependencies, language)
        
        # Analyze code for resources
        ports = self.detect_ports()
        env_vars = self.detect_env_vars()
        database = self.detect_database(dependencies)
        
        # Estimate resources
        resources = self.estimate_resources(dependencies, gpu_libs)
        
        # Generate container image recommendation
        base_image = self.recommend_base_image(language, framework, gpu_libs)
        
        # Platform recommendation
        platform = self.recommend_nvidia_platform(gpu_libs, resources)
        
        # Create requirements object
        self.requirements = AppRequirements(
            language=language,
            framework=framework,
            dependencies=dependencies,
            gpu_required=len(gpu_libs) > 0,
            gpu_libraries=gpu_libs,
            estimated_cpu=resources['cpu'],
            estimated_ram=resources['ram'],
            estimated_gpu_ram=resources['gpu_ram'],
            storage_size=resources['storage'],
            exposed_ports=ports,
            environment_vars=env_vars,
            database_type=database,
            container_base_image=base_image,
            nvidia_platform_recommendation=platform
        )
        
        return self.generate_report()
    
    def detect_language(self) -> str:
        """Detect primary programming language"""
        language_files = {
            'python': ['.py', 'requirements.txt', 'Pipfile', 'pyproject.toml'],
            'node': ['.js', '.ts', 'package.json', 'yarn.lock'],
            'java': ['.java', 'pom.xml', 'build.gradle'],
            'go': ['.go', 'go.mod'],
            'rust': ['.rs', 'Cargo.toml'],
            'cpp': ['.cpp', '.cu', '.cuh', 'CMakeLists.txt'],
        }
        
        file_counts = {}
        for lang, extensions in language_files.items():
            count = 0
            for ext in extensions:
                if ext.startswith('.'):
                    count += len(list(self.project_path.rglob(f'*{ext}')))
                else:
                    count += len(list(self.project_path.rglob(ext)))
            file_counts[lang] = count
        
        return max(file_counts, key=file_counts.get) if file_counts else 'unknown'
    
    def detect_framework(self, language: str) -> Optional[str]:
        """Detect web framework or ML framework"""
        if language not in self.frameworks:
            return None
        
        for framework, patterns in self.frameworks[language].items():
            for pattern in patterns:
                # Check in files
                for file_path in self.project_path.rglob('*'):
                    if file_path.is_file():
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                if pattern in content:
                                    return framework
                        except:
                            continue
        
        return None
    
    def get_dependencies(self, language: str) -> List[str]:
        """Extract project dependencies"""
        dependencies = []
        
        if language == 'python':
            # Check requirements.txt
            req_file = self.project_path / 'requirements.txt'
            if req_file.exists():
                with open(req_file, 'r') as f:
                    dependencies = [line.strip().split('==')[0] 
                                  for line in f if line.strip() and not line.startswith('#')]
        
        elif language == 'node':
            # Check package.json
            package_json = self.project_path / 'package.json'
            if package_json.exists():
                with open(package_json, 'r') as f:
                    data = json.load(f)
                    deps = data.get('dependencies', {})
                    dev_deps = data.get('devDependencies', {})
                    dependencies = list(deps.keys()) + list(dev_deps.keys())
        
        return dependencies
    
    def detect_gpu_libraries(self, dependencies: List[str], language: str) -> List[str]:
        """Detect GPU-accelerated libraries"""
        gpu_libs = []
        
        if language in self.gpu_libraries:
            gpu_lib_list = self.gpu_libraries[language]
            for dep in dependencies:
                dep_lower = dep.lower()
                for gpu_lib in gpu_lib_list:
                    if gpu_lib in dep_lower:
                        gpu_libs.append(dep)
                        break
        
        return gpu_libs
    
    def detect_ports(self) -> List[int]:
        """Detect exposed ports from code"""
        ports = []
        
        # Check .replit file
        replit_file = self.project_path / '.replit'
        if replit_file.exists():
            with open(replit_file, 'r') as f:
                content = f.read()
                matches = re.findall(r'(\d{4,5})', content)
                for match in matches:
                    port = int(match)
                    if 1000 <= port <= 65535 and port not in ports:
                        ports.append(port)
        
        # Default to common port if none found
        if not ports:
            ports = [8000]
        
        return ports
    
    def detect_env_vars(self) -> List[str]:
        """Detect environment variables used"""
        env_vars = set()
        
        # Check .env file
        env_file = self.project_path / '.env'
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        var_name = line.split('=')[0].strip()
                        if var_name:
                            env_vars.add(var_name)
        
        return list(env_vars)
    
    def detect_database(self, dependencies: List[str]) -> Optional[str]:
        """Detect database type from dependencies"""
        database_mapping = {
            'postgresql': ['psycopg2', 'pg', 'postgres', 'postgresql'],
            'mysql': ['mysql', 'pymysql', 'mysql2'],
            'mongodb': ['pymongo', 'mongodb', 'mongoose'],
            'redis': ['redis', 'ioredis'],
            'sqlite': ['sqlite3', 'sqlite'],
        }
        
        for db_type, db_deps in database_mapping.items():
            for dep in dependencies:
                if any(db_dep in dep.lower() for db_dep in db_deps):
                    return db_type
        
        return None
    
    def estimate_resources(self, dependencies: List[str], gpu_libs: List[str]) -> Dict[str, str]:
        """Estimate resource requirements"""
        resources = {
            'cpu': '2 cores',
            'ram': '4GB',
            'gpu_ram': '0GB',
            'storage': '10GB'
        }
        
        # GPU requirements
        if gpu_libs:
            resources['gpu_ram'] = '8GB'  # Minimum for most ML workloads
            resources['cpu'] = '4 cores'
            resources['ram'] = '16GB'
        
        return resources
    
    def recommend_base_image(self, language: str, framework: Optional[str], gpu_libs: List[str]) -> str:
        """Recommend NVIDIA container base image"""
        if gpu_libs:
            if language == 'python':
                if 'tensorflow' in str(gpu_libs):
                    return 'nvcr.io/nvidia/tensorflow:latest'
                elif 'torch' in str(gpu_libs) or 'pytorch' in str(gpu_libs):
                    return 'nvcr.io/nvidia/pytorch:latest'
                else:
                    return 'nvcr.io/nvidia/cuda:12.2.0-runtime-ubuntu22.04'
            else:
                return 'nvcr.io/nvidia/cuda:12.2.0-devel-ubuntu22.04'
        else:
            # Non-GPU images
            if language == 'python':
                return f'python:3.11-slim'
            elif language == 'node':
                return 'node:18-alpine'
            else:
                return 'ubuntu:22.04'
    
    def recommend_nvidia_platform(self, gpu_libs: List[str], resources: Dict[str, str]) -> str:
        """Recommend appropriate NVIDIA platform"""
        if not gpu_libs:
            return "NGC (CPU-only container)"
        
        gpu_ram = int(resources['gpu_ram'].replace('GB', ''))
        
        if gpu_ram >= 16:
            return "DGX Cloud (High-performance GPU computing)"
        elif gpu_ram >= 8:
            return "NVIDIA AI Enterprise (Production AI workloads)"
        else:
            return "NGC (GPU-accelerated containers)"
    
    def generate_dockerfile(self) -> str:
        """Generate Dockerfile for the project"""
        if not self.requirements:
            return ""
        
        req = self.requirements
        dockerfile = f'''# Auto-generated Dockerfile for NVIDIA Cloud migration
FROM {req.container_base_image}

WORKDIR /app

'''
        
        if req.language == 'python':
            dockerfile += '''# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

'''
        elif req.language == 'node':
            dockerfile += '''# Install Node dependencies
COPY package*.json ./
RUN npm ci --only=production

'''
        
        dockerfile += '''# Copy application code
COPY . .

'''
        
        if req.exposed_ports:
            dockerfile += '# Expose ports\n'
            for port in req.exposed_ports:
                dockerfile += f'EXPOSE {port}\n'
            dockerfile += '\n'
        
        if req.gpu_required:
            dockerfile += '''# GPU configuration
ENV CUDA_VISIBLE_DEVICES=0
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

'''
        
        # Add CMD based on language/framework
        if req.language == 'python':
            if req.framework == 'flask':
                dockerfile += 'CMD ["python", "app.py"]'
            else:
                dockerfile += 'CMD ["python", "main.py"]'
        elif req.language == 'node':
            dockerfile += 'CMD ["node", "index.js"]'
        
        return dockerfile
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive migration report"""
        if not self.requirements:
            return {"error": "Analysis failed"}
        
        req = self.requirements
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "project_path": str(self.project_path),
            "summary": {
                "language": req.language,
                "framework": req.framework,
                "gpu_required": req.gpu_required,
                "nvidia_platform": req.nvidia_platform_recommendation,
                "estimated_monthly_cost": self.estimate_cost(),
            },
            "requirements": asdict(req),
            "migration_files": {
                "dockerfile": self.generate_dockerfile(),
            },
            "migration_checklist": self.generate_checklist(),
            "recommendations": self.generate_recommendations(),
        }
        
        return report
    
    def generate_checklist(self) -> List[str]:
        """Generate migration checklist"""
        checklist = [
            "Export project from Replit",
            "Review and update environment variables",
            "Create NGC account",
            "Install NVIDIA Container Toolkit locally",
            "Build and test Docker container locally",
            "Push container to NGC registry",
        ]
        
        if self.requirements.gpu_required:
            checklist.extend([
                "Verify CUDA compatibility",
                "Test GPU acceleration locally",
                "Configure GPU resource limits",
            ])
        
        checklist.extend([
            "Deploy to NVIDIA Cloud platform",
            "Test all functionality",
        ])
        
        return checklist
    
    def generate_recommendations(self) -> List[str]:
        """Generate specific recommendations"""
        recommendations = []
        
        if self.requirements.gpu_required:
            recommendations.append(
                f"GPU Optimization: Your app uses {', '.join(self.requirements.gpu_libraries)}. "
                f"Consider using NVIDIA's optimized containers."
            )
        
        recommendations.append(
            f"Platform: {self.requirements.nvidia_platform_recommendation} is recommended "
            "based on your application's requirements."
        )
        
        return recommendations
    
    def estimate_cost(self) -> str:
        """Estimate monthly cost (rough estimate)"""
        base_cost = 100  # Base platform cost
        
        if self.requirements.gpu_required:
            base_cost += 200  # GPU cost
        
        return f"${base_cost} - ${base_cost * 1.5} USD"
    
    def print_summary(self):
        """Print analysis summary to console"""
        if not self.requirements:
            print("❌ Analysis failed")
            return
        
        req = self.requirements
        
        print("\n" + "="*60)
        print("📊 MIGRATION ANALYSIS COMPLETE")
        print("="*60)
        
        print(f"\n🔧 Application Details:")
        print(f"  Language: {req.language}")
        print(f"  Framework: {req.framework or 'None detected'}")
        print(f"  Dependencies: {len(req.dependencies)} packages")
        
        print(f"\n💻 Resource Requirements:")
        print(f"  CPU: {req.estimated_cpu}")
        print(f"  RAM: {req.estimated_ram}")
        if req.gpu_required:
            print(f"  GPU RAM: {req.estimated_gpu_ram}")
            print(f"  GPU Libraries: {', '.join(req.gpu_libraries)}")
        
        print(f"\n🚀 NVIDIA Platform Recommendation:")
        print(f"  {req.nvidia_platform_recommendation}")
        
        print(f"\n💰 Estimated Monthly Cost:")
        print(f"  {self.estimate_cost()}")
        
        print("\n" + "="*60)


def main():
    """Main function for CLI usage"""
    parser = argparse.ArgumentParser(
        description="Analyze Replit projects for NVIDIA Cloud migration"
    )
    parser.add_argument(
        "project_path",
        help="Path to the Replit project directory"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output analysis as JSON"
    )
    
    args = parser.parse_args()
    
    # Validate project path
    project_path = Path(args.project_path)
    if not project_path.exists():
        print(f"❌ Error: Project path does not exist: {project_path}")
        return 1
    
    # Run analysis
    analyzer = ReplitMigrationAnalyzer(str(project_path))
    report = analyzer.analyze()
    
    if args.json:
        # Output as JSON
        print(json.dumps(report, indent=2))
    else:
        # Print summary
        analyzer.print_summary()
    
    return 0


if __name__ == "__main__":
    exit(main())