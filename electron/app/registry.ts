// electron/app/registry.ts
// Contains Windows-specific registry functions and related IPC handlers.
import { app } from 'electron';
import { execSync } from 'node:child_process';
import { PROTOCOLS_TO_HANDLE, APP_ID, APP_NAME, APP_DESCRIPTION, COMPANY_NAME } from './config.js'; // Import from config

// --- Constants (Removed - Imported from config.js) ---

// --- Windows Registry Registration using reg.exe (Moved from main.ts) ---
async function registerAppCapabilitiesWindows(): Promise<{ success: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { success: true };
  }
  console.log('Registering application capabilities via reg.exe...');
  try {
    const rawAppPath = app.getPath('exe');
    // Ensure path separators are correctly escaped for reg command
    const appPathCmd = rawAppPath.replace(/\\/g, '\\');
    const appIconCmd = `${appPathCmd},0`;

    const capabilitiesKeyPath = `HKCU\\Software\\${COMPANY_NAME}\\${APP_NAME}\\Capabilities`;
    const urlAssociationsPath = `${capabilitiesKeyPath}\\URLAssociations`;
    const classKeyPath = `HKCU\\Software\\Classes\\${APP_ID}`;
    const commandPath = `${classKeyPath}\\shell\\open\\command`;
    const defaultIconPath = `${classKeyPath}\\DefaultIcon`;
    const registeredAppPath = 'HKCU\\Software\\RegisteredApplications';

    const regCommands = [
      // Create Capabilities key and values
      `reg add "${capabilitiesKeyPath}" /v ApplicationName /t REG_SZ /d "${APP_NAME}" /f`,
      `reg add "${capabilitiesKeyPath}" /v ApplicationDescription /t REG_SZ /d "${APP_DESCRIPTION}" /f`,
      `reg add "${capabilitiesKeyPath}" /v ApplicationIcon /t REG_SZ /d "${appIconCmd}" /f`,
      // Create URLAssociations subkey
      `reg add "${urlAssociationsPath}" /f`,
      // Add protocol associations
      ...PROTOCOLS_TO_HANDLE.map(protocol =>
        `reg add "${urlAssociationsPath}" /v ${protocol} /t REG_SZ /d "${APP_ID}" /f`
      ),
      // Register application entry
      `reg add "${registeredAppPath}" /v "${APP_NAME}" /t REG_SZ /d "Software\\${COMPANY_NAME}\\${APP_NAME}\\Capabilities" /f`,
      // Create Class key and values
      `reg add "${classKeyPath}" /ve /t REG_SZ /d "${APP_NAME} URL Handler" /f`,
      // Create DefaultIcon subkey and set value
      `reg add "${defaultIconPath}" /ve /t REG_SZ /d "${appIconCmd}" /f`,
      // Create command subkey and set value
      `reg add "${commandPath}" /ve /t REG_SZ /d "\"${appPathCmd}\" \"%1\"" /f`
    ];

    for (const cmd of regCommands) {
      console.log(`Executing: ${cmd}`);
      execSync(cmd);
    }

    console.log('Successfully executed registry commands.');
    return { success: true };

  } catch (error: unknown) {
    console.error('Error executing registry commands:', error);
    const message = error instanceof Error ? error.message : 'Unknown error executing reg.exe';
    return { success: false, error: message };
  }
}

/**
 * Tries to register capabilities and set the app as the default handler for HTTP/HTTPS.
 * Returns a detailed status object.
 */
async function registerAsDefaultBrowser(): Promise<{ 
  success: boolean; 
  requiresAdmin?: boolean; 
  alreadyRegistered: boolean; 
  message: string 
}> {
  console.log('Starting registration process...');
  let overallSuccess = true;
  let attemptedRegistration = false;
  let requiresAdminLikely = false;
  let alreadyDefaultForAll = true;
  const messages: string[] = [];

  // Step 1: Register capabilities
  if (process.platform === 'win32') {
    const capResult = await registerAppCapabilitiesWindows();
    if (!capResult.success) {
      messages.push(`Failed to register application capabilities: ${capResult.error || 'Unknown error'}.`);
      overallSuccess = false;
    } else {
      messages.push('Application capabilities registered successfully.');
    }
  }

  // Step 2: Attempt to set as default
  for (const protocol of PROTOCOLS_TO_HANDLE) {
    let isCurrentlyDefault = false;
    try {
      isCurrentlyDefault = app.isDefaultProtocolClient(protocol);
    } catch (e) {
      console.warn(`Could not check default status for ${protocol}:`, e);
      isCurrentlyDefault = false;
    }

    if (!isCurrentlyDefault) {
      alreadyDefaultForAll = false;
      console.log(`Attempting to set as default for ${protocol}...`);
      attemptedRegistration = true;
      let setAttemptSuccess = false;
      try {
        setAttemptSuccess = app.setAsDefaultProtocolClient(protocol);
        console.log(`Electron setAsDefaultProtocolClient attempt for ${protocol} returned: ${setAttemptSuccess}`);
        let isNowDefault = false;
        try {
          isNowDefault = app.isDefaultProtocolClient(protocol);
          console.log(`Verification check: Is now default for ${protocol}? ${isNowDefault}`);
        } catch (e) {
          console.warn(`Could not verify default status for ${protocol} after setting attempt:`, e);
        }
        if (setAttemptSuccess && isNowDefault) {
          messages.push(`Successfully set as default handler for ${protocol}.`);
        } else {
          overallSuccess = false;
          requiresAdminLikely = true;
          messages.push(`Failed to set/verify as default for ${protocol}. Admin rights or manual setting via Windows Settings likely required.`);
        }
      } catch (error: unknown) {
        console.error(`Error during setAsDefaultProtocolClient for ${protocol}:`, error);
        overallSuccess = false;
        requiresAdminLikely = true;
        messages.push(`Error setting default for ${protocol}: ${error instanceof Error ? error.message : 'Unknown error'}. Admin rights might be needed.`);
      }
    } else {
      console.log(`Already default for ${protocol}.`);
      messages.push(`Already the default handler for ${protocol}.`);
    }
  }

  // Step 3: Determine final message (Simplified logic)
  let finalMessage = messages.join(' ');
  if (alreadyDefaultForAll && overallSuccess) {
    finalMessage = "Browser Link is already the default handler and capabilities seem registered.";
  } else if (attemptedRegistration && overallSuccess) {
    finalMessage = "Registration attempt succeeded. Please verify in Windows Settings if needed.";
  } else if (!overallSuccess && requiresAdminLikely) {
    finalMessage = "Registration attempt failed, likely due to permissions. Please try running as administrator, or set manually via Windows Settings.";
  } else if (!overallSuccess) {
    finalMessage = "Registration process completed with errors. Check logs and try setting manually via Windows Settings.";
  } else if (overallSuccess && !attemptedRegistration) {
    finalMessage = "Already default and capabilities registered. No changes made.";
  }

  console.log('Registration process finished. Result:', { 
    success: overallSuccess, 
    requiresAdmin: requiresAdminLikely && !overallSuccess, // More precise check
    alreadyRegistered: alreadyDefaultForAll, 
    message: finalMessage 
  });
  return {
    success: overallSuccess,
    requiresAdmin: requiresAdminLikely && !overallSuccess,
    alreadyRegistered: alreadyDefaultForAll,
    message: finalMessage
  };
}

export { registerAsDefaultBrowser }; // Only export the main function needed by IPC 