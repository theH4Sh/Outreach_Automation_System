const { chromium } = require('playwright');
const { spawn } = require('child_process');


const sessions = new Map()

const integrator = async (profileName) => {
	const display = 99;
	const vncPort = 5900;
	const webPort = 6080;

	    // Connection lifetime: 10 minutes
    const SESSION_TIMEOUT = 10 * 60 * 1000;
	//const SESSION_TIMEOUT = 20000

	// Start xvfb
	const xvfb = spawn('Xvfb', [
		`:${display}`,
		'-screen',
		'0',
		'1920x1080x24',
	])

	xvfb.on('error', (err) => {
		console.error('Xvfb error:', err)
	})
	//allowing xvfb to start
	await new Promise(resolve => setTimeout(resolve, 1000))
	
	
	const env = { ...process.env };

	env.DISPLAY = `:${display}`;
	delete env.WAYLAND_DISPLAY;
	// Start x11vnc
	const x11vnc = spawn(
		'x11vnc',
		[
			'-display',
			`:${display}`,
			'-forever',
			'-shared',
			'-rfbport',
			`${vncPort}`,
			'-nopw'
		],
		{ env }
	);

	x11vnc.stdout.on('data', data => {
    console.log('[x11vnc]', data.toString());
	});

	x11vnc.stderr.on('data', data => {
		console.error('[x11vnc]', data.toString());
	});

	x11vnc.on('close', code => {
		console.log(`x11vnc exited with code ${code}`);
	});


	x11vnc.on('error', (err) => {
		console.error('x11vnc error:', err)
	})

	await new Promise(resolve => setTimeout(resolve, 1000))

	// Start noVNC

	const novnc = spawn('novnc', [
		'--vnc',
		`localhost:${vncPort}`,
		'--listen',
		`${webPort}`
	])


    novnc.on('error', (err) => {
        console.error('noVNC error:', err);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

	try {
		const browser = await chromium.launchPersistentContext(
			`./profiles/${profileName}`,
			{
				headless: false,
				viewport: null,

				env: {
					...process.env,
					DISPLAY: `:${display}`,
					WAYLAND_DISPLAY: 'undefined'
				},

				args: [
					'--ozone-platform=x11',
					'--no-sandbox',
					'--disable-dev-shm-usage',
					'--disable-gpu'
				]
			}
		);
		
		const page = await browser.newPage();

		page.setDefaultTimeout(0);
		page.setDefaultNavigationTimeout(0);

		await page.goto('https://www.instagram.com/');
		console.log('Page Title: ', await page.title());

		//// UNCOMMENT BELOW============================

		// const saveInfoBtn = page.locator('button:has-text("Save info")');

		// await saveInfoBtn.waitFor({ state: 'visible', timeout: 0 });
		// await saveInfoBtn.click();

		// console.log("Save info clicked");

		//================================================

		// await page.context().storageState({ path: 'pauth.json' });
		// console.log('Auth state saved successfully')

		//browser.close()

		sessions.set(profileName, {
			browser,
			xvfb,
			x11vnc,
			novnc
		});

		// Automatically destroy ONLY the connection after 10 minutes
        setTimeout(async () => {
            console.log(`Connection timeout reached for ${profileName}`);

            try {
                await browser.close();
            } catch (err) {
                console.error('Browser close error:', err);
            }

            if (!x11vnc.killed) {
                x11vnc.kill('SIGTERM');
            }

            if (!novnc.killed) {
                novnc.kill('SIGTERM');
            }

            if (!xvfb.killed) {
                xvfb.kill('SIGTERM');
            }

            console.log(`Connection ended for ${profileName}`);
        }, SESSION_TIMEOUT);

		return {
			url: `http://localhost:${webPort}/vnc.html?autoconnect=true&resize=scale`
		}
	} catch (error) {
		console.error('Integration failed:', error);
		throw error; // Rethrow the error to be caught by the controller's catchAsync
	}
};

const stopIntegration = async (profileName) => {
    const session = sessions.get(profileName);

    if (!session) {
        return false;
    }

    console.log(`Stopping integration for ${profileName}`);

    await session.browser.close().catch(() => {});

    session.x11vnc.kill('SIGTERM');
    session.novnc.kill('SIGTERM');
    session.xvfb.kill('SIGTERM');

    sessions.delete(profileName);

    console.log(`Integration stopped for ${profileName}`);

    return true;
};

module.exports = {
	integrator,
	stopIntegration
}