// (c) Copyright Ascensio System SIA 2009-2025
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

interface ErrorDetail {
  testName: string
  message: string
  name: string
  stack?: string
}

interface ModuleErrors {
  modulePath: string
  failedTests: ErrorDetail[]
  collectionErrors: Array<{ message: string; name: string }>
  passedTests: string[]
}

export class HtmlReportGenerator {
  private static readonly LONG_MESSAGE_THRESHOLD = 500
  private static readonly COLLAPSED_HEIGHT = 300

  constructor(
    private passedModules: ModuleErrors[],
    private failedModules: ModuleErrors[],
    private unhandledErrors: any[],
  ) {}

  generateHtml(): string {
    const timestamp = new Date().toISOString()
    const totalModules = this.failedModules.length + this.passedModules.length
    const totalPassedTests =
      this.passedModules.reduce((sum, m) => sum + m.passedTests.length, 0) +
      this.failedModules.reduce((sum, m) => sum + m.passedTests.length, 0)
    const totalFailedTests = this.failedModules.reduce((sum, m) => sum + m.failedTests.length, 0)
    const totalCollectionErrors = this.failedModules.reduce(
      (sum, m) => sum + m.collectionErrors.length,
      0,
    )
    const totalUnhandledErrors = this.unhandledErrors.length

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Test Report</h1>
      <div class="meta">Generated on ${timestamp}</div>
    </div>

    <div class="summary">
      ${totalPassedTests > 0 ? `
        <div class="summary-card passed">
          <div class="number">${totalPassedTests}</div>
          <div class="label">Passed Tests</div>
        </div>
      ` : ''}
      ${totalFailedTests > 0 ? `
        <div class="summary-card failed">
          <div class="number">${totalFailedTests}</div>
          <div class="label">Failed Tests</div>
        </div>
      ` : ''}
      ${totalCollectionErrors > 0 ? `
        <div class="summary-card warning">
          <div class="number">${totalCollectionErrors}</div>
          <div class="label">Collection Errors</div>
        </div>
      ` : ''}
      ${totalUnhandledErrors > 0 ? `
        <div class="summary-card error">
          <div class="number">${totalUnhandledErrors}</div>
          <div class="label">Unhandled Errors</div>
        </div>
      ` : ''}
      <div class="summary-card">
        <div class="number">${totalModules}</div>
        <div class="label">Total Modules</div>
      </div>
    </div>

    <div class="content">
      ${this.renderPassedTests()}
      ${this.renderFailedTests()}
      ${this.renderUnhandledErrors()}
    </div>

    <div class="footer">
      <p>Test execution completed. Review the results above.</p>
    </div>
  </div>

  <script>
    ${this.getScripts()}
  </script>
</body>
</html>`
  }

  private renderPassedTests(): string {
    if (this.passedModules.length === 0) {
      return ''
    }

    const modulesHtml = this.passedModules
      .map(moduleData => {
        const passedTestsHtml = moduleData.passedTests
          .map(testName => `
            <div class="passed-test-item">${this.escapeHtml(testName)}</div>
          `)
          .join('')

        return `
          <div class="test-file passed">
            <div class="test-file-name">${this.escapeHtml(moduleData.modulePath)}</div>
            <div>${passedTestsHtml}</div>
          </div>
        `
      })
      .join('')

    return `
      <div class="section">
        <div class="section-title success">✓ Passed Tests</div>
        ${modulesHtml}
      </div>
    `
  }

  private renderFailedTests(): string {
    if (this.failedModules.length === 0) {
      return ''
    }

    const modulesHtml = this.failedModules
      .map(moduleError => {
        const failedTestsHtml = moduleError.failedTests
          .map((test, idx) => {
            const msgId = `error-msg-${Math.random().toString(36).substr(2, 9)}`
            const isLong = test.message.length > HtmlReportGenerator.LONG_MESSAGE_THRESHOLD

            return `
            <div class="test-failure failed">
              <div class="test-title">
                <strong>${idx + 1})</strong> ${this.escapeHtml(test.testName)}
              </div>
              <div class="test-error">
                <div class="error-message-box">
                  <div class="error-message-preview ${isLong ? 'collapsed' : ''}" id="${msgId}">
                    ${this.escapeHtml(test.message.trim())}
                  </div>
                  ${isLong ? `<button class="error-toggle-btn" data-toggle="${msgId}">Show more</button>` : ''}
                </div>
              </div>
            </div>
          `
          })
          .join('')

        const collectionErrorsHtml = moduleError.collectionErrors
          .map((error, idx) => {
            const msgId = `error-msg-${Math.random().toString(36).substr(2, 9)}`
            const isLong = error.message.length > HtmlReportGenerator.LONG_MESSAGE_THRESHOLD

            return `
            <div class="test-failure failed">
              <div class="test-title">
                <strong>${moduleError.failedTests.length + idx + 1})</strong> Collection Error
              </div>
              <div class="test-error">
                <div class="error-message-box">
                  <div class="error-message-preview ${isLong ? 'collapsed' : ''}" id="${msgId}">
                    ${this.escapeHtml(error.message.trim())}
                  </div>
                  ${isLong ? `<button class="error-toggle-btn" data-toggle="${msgId}">Show more</button>` : ''}
                </div>
              </div>
            </div>
          `
          })
          .join('')

        return `
          <div class="test-file failed">
            <div class="test-file-name">${this.escapeHtml(moduleError.modulePath)}</div>
            <div>
              ${failedTestsHtml}
              ${collectionErrorsHtml}
            </div>
          </div>
        `
      })
      .join('')

    return `
      <div class="section">
        <div class="section-title failed">✗ Failed Tests & Errors</div>
        ${modulesHtml}
      </div>
    `
  }

  private renderUnhandledErrors(): string {
    if (this.unhandledErrors.length === 0) {
      return ''
    }

    const errorsHtml = this.unhandledErrors
      .map((error, idx) => `
        <div class="test-failure">
          <div class="test-title">
            <strong>${idx + 1})</strong> Unhandled ${this.escapeHtml(error.name || 'Error')}
          </div>
          <div class="test-error">
            <div class="error-message-box">${this.escapeHtml(error.message)}</div>
          </div>
        </div>
      `)
      .join('')

    return `
      <div class="section">
        <div class="section-title">⚠️ Unhandled Errors</div>
        <div class="test-file">
          <div class="test-file-name">Global Errors</div>
          <div>${errorsHtml}</div>
        </div>
      </div>
    `
  }

  private getStyles(): string {
    return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      height: 100%;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #222;
      font-size: 14px;
      line-height: 1.5;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0;
    }

    .header {
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 30px 40px;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #222;
      margin-bottom: 5px;
    }

    .header .meta {
      color: #999;
      font-size: 13px;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      padding: 20px 40px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #999;
    }

    .summary-card.passed {
      border-left-color: #22c55e;
      background: #f0fdf4;
    }

    .summary-card.failed {
      border-left-color: #e21c3d;
      background: #fff5f6;
    }

    .summary-card.warning {
      border-left-color: #f5a623;
      background: #fffbf0;
    }

    .summary-card.error {
      border-left-color: #e74c3c;
      background: #fff5f5;
    }

    .summary-card .number {
      font-size: 24px;
      font-weight: 700;
      color: #222;
    }

    .summary-card.passed .number {
      color: #22c55e;
    }

    .summary-card.failed .number {
      color: #e21c3d;
    }

    .summary-card.warning .number {
      color: #f5a623;
    }

    .summary-card.error .number {
      color: #e74c3c;
    }

    .summary-card .label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content {
      padding: 30px 40px;
    }

    .section {
      margin-bottom: 50px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-title.success {
      color: #22c55e;
    }

    .section-title.failed {
      color: #e21c3d;
    }

    .test-file {
      margin-bottom: 30px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .test-file.passed {
      border-color: #d4edda;
      background: #f8fff9;
    }

    .test-file.failed {
      border-color: #f5c2c7;
      background: #fff8f9;
    }

    .test-file-name {
      background: #f5f5f5;
      padding: 12px 16px;
      font-weight: 600;
      color: #e21c3d;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .test-file.passed .test-file-name {
      background: #d4edda;
      color: #155724;
      border-bottom-color: #c3e6cb;
    }

    .test-file.failed .test-file-name {
      background: #f5c2c7;
      color: #842029;
      border-bottom-color: #f1b0b7;
    }

    .test-file-name.collection-error {
      color: #f5a623;
    }

    .test-file-name::before {
      content: '●';
      font-size: 10px;
    }

    .test-file.passed .test-file-name::before {
      content: '✓';
      font-size: 12px;
    }

    .test-file.failed .test-file-name::before {
      content: '✕';
      font-size: 12px;
    }

    .test-failure {
      padding: 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .test-failure:last-child {
      border-bottom: none;
    }

    .test-failure.passed {
      border-bottom-color: #e8f5e9;
    }

    .test-failure.failed {
      border-bottom-color: #f8d7da;
    }

    .test-title {
      padding: 12px 16px;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
      font-weight: 500;
      color: #222;
      font-size: 13px;
      word-break: break-word;
    }

    .test-failure.passed .test-title {
      background: #f1f8f4;
      border-bottom-color: #e8f5e9;
    }

    .test-failure.failed .test-title {
      background: #fff5f6;
      border-bottom-color: #f8d7da;
    }

    .test-title strong {
      color: #e21c3d;
    }

    .test-failure.passed .test-title strong {
      color: #22c55e;
    }

    .test-failure.failed .test-title strong {
      color: #d32f2f;
    }

    .test-error {
      padding: 12px 16px;
      background: #ffebee;
    }

    .test-failure.passed .test-error {
      background: #f1f8f4;
      padding: 0;
    }

    .test-failure.failed .test-error {
      background: #fff5f6;
      padding: 0;
    }

    .error-message-box {
      padding: 12px 16px;
      color: #842029;
      font-size: 13px;
      line-height: 1.6;
      word-break: break-word;
      white-space: pre-line;
      overflow-wrap: break-word;
      display: block;
    }

    .error-message-box::before {
      content: '✕ ';
      color: #d32f2f;
      font-weight: bold;
      margin-right: -4px;
    }

    .error-message-preview {
      display: block;
      position: relative;
    }

    .error-message-preview.collapsed {
      max-height: ${HtmlReportGenerator.COLLAPSED_HEIGHT}px;
      overflow: hidden;
    }

    .error-message-preview.collapsed::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: linear-gradient(transparent, #fff5f6);
      pointer-events: none;
    }

    .error-toggle-btn {
      display: block;
      margin-top: 10px;
      padding: 6px 12px;
      background: #f5c2c7;
      border: 1px solid #f1b0b7;
      border-radius: 3px;
      color: #842029;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .error-toggle-btn:hover {
      background: #f1b0b7;
    }

    .passed-test-item {
      padding: 10px 16px;
      color: #155724;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .passed-test-item::before {
      content: '✓';
      color: #22c55e;
      font-weight: bold;
      font-size: 14px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state h2 {
      font-size: 24px;
      color: #222;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .empty-state p {
      color: #999;
    }

    .footer {
      background: #f5f5f5;
      padding: 20px 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
      margin-top: 50px;
    }

    @media (max-width: 768px) {
      .summary {
        grid-template-columns: 1fr;
      }

      .header, .content, .footer {
        padding: 20px;
      }

      .section-title {
        font-size: 16px;
      }
    }
    `
  }

  private getScripts(): string {
    return `
    document.querySelectorAll('.error-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const toggleId = this.getAttribute('data-toggle');
        const preview = document.getElementById(toggleId);
        if (preview) {
          preview.classList.toggle('collapsed');
          const isNowCollapsed = preview.classList.contains('collapsed');
          this.textContent = isNowCollapsed ? 'Show more' : 'Show less';
        }
      });
    });
    `
  }

  private escapeHtml(text: string | undefined): string {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
