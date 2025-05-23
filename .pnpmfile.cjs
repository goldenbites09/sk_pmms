/**
 * This file is used to modify the behavior of pnpm during installation.
 * It helps resolve dependency issues and ensures compatibility.
 */
module.exports = {
  hooks: {
    readPackage: (pkg) => {
      // Force specific versions to ensure compatibility
      if (pkg.dependencies) {
        // Ensure date-fns version is fixed
        if (pkg.dependencies['date-fns']) {
          pkg.dependencies['date-fns'] = '4.1.0';
        }
        
        // Ensure React versions are compatible
        if (pkg.dependencies['react']) {
          pkg.dependencies['react'] = '^19.0.0';
        }
        
        if (pkg.dependencies['react-dom']) {
          pkg.dependencies['react-dom'] = '^19.0.0';
        }
        
        // Ensure Next.js version is fixed
        if (pkg.dependencies['next']) {
          pkg.dependencies['next'] = '15.2.4';
        }
      }
      
      return pkg;
    },
  },
};
