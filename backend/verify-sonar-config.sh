#!/bin/bash
# VERIFICACIÓN DE CONFIGURACIÓN SONARQUBE
# =======================================
# Ejecuta este script para verificar que todo está configurado correctamente

echo "🔍 Verificando Configuración de SonarQube..."
echo ""

# 1. Verificar archivos creados
echo "✅ Archivos Creados:"
echo "-------------------"

if [ -f "sonar-project.properties" ]; then
  echo "✓ sonar-project.properties"
else
  echo "✗ sonar-project.properties (FALTA)"
fi

if [ -f ".sonarignore" ]; then
  echo "✓ .sonarignore"
else
  echo "✗ .sonarignore (FALTA)"
fi

if [ -f "jest.config.js" ]; then
  echo "✓ jest.config.js (actualizado)"
else
  echo "✗ jest.config.js (FALTA)"
fi

echo ""

# 2. Verificar contenido de sonar-project.properties
echo "✅ Contenido de sonar-project.properties:"
echo "-------------------------------------------"
grep -c "__tests__" sonar-project.properties && echo "✓ Contiene exclusión de __tests__/" || echo "✗ NO contiene exclusión"
grep -c "coverage" sonar-project.properties && echo "✓ Contiene exclusión de coverage/" || echo "✗ NO contiene exclusión"
grep -c "node_modules" sonar-project.properties && echo "✓ Contiene exclusión de node_modules/" || echo "✗ NO contiene exclusión"

echo ""

# 3. Verificar contenido de .sonarignore
echo "✅ Contenido de .sonarignore:"
echo "------------------------------"
grep -c "__tests__" .sonarignore && echo "✓ Contiene __tests__/" || echo "✗ NO contiene"
grep -c "coverage" .sonarignore && echo "✓ Contiene coverage/" || echo "✗ NO contiene"
grep -c "*.test.js" .sonarignore && echo "✓ Contiene *.test.js" || echo "✗ NO contiene"

echo ""

# 4. Verificar tests
echo "✅ Estado de Tests:"
echo "------------------"
if command -v npm &> /dev/null; then
  npm test > /dev/null 2>&1 && echo "✓ Tests pasando" || echo "✗ Tests fallando"
else
  echo "⚠ npm no disponible"
fi

echo ""

echo "🎉 ¡Verificación completada!"
echo ""
echo "Próximo paso: git push origin master"
