import { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { 
  QrCode, 
  Link, 
  FileText, 
  User, 
  Download, 
  Copy, 
  Check,
  Trash2,
  Settings,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';
import QRCode from 'qrcode';

const QRGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // URL form state
  const [urlData, setUrlData] = useState({
    url: '',
    title: ''
  });

  // Text form state
  const [textData, setTextData] = useState('');

  // Contact form state
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    title: '',
    address: '',
    website: ''
  });

  const generateQRCode = async (data, options = {}) => {
    setIsGenerating(true);
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrDataURL = await QRCode.toDataURL(data, qrOptions);
      setQrCodeImage(qrDataURL);
      setQrCodeData(data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateURLQR = () => {
    if (!urlData.url.trim()) {
      alert('Please enter a URL');
      return;
    }
    
    let url = urlData.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    generateQRCode(url);
  };

  const generateTextQR = () => {
    if (!textData.trim()) {
      alert('Please enter some text');
      return;
    }
    
    generateQRCode(textData);
  };

  const generateContactQR = () => {
    const { firstName, lastName, email, phone, organization, title, address, website } = contactData;
    
    if (!firstName.trim() && !lastName.trim() && !email.trim() && !phone.trim()) {
      alert('Please enter at least one contact field');
      return;
    }

    // Generate vCard format
    let vCard = 'BEGIN:VCARD\n';
    vCard += 'VERSION:3.0\n';
    
    if (firstName || lastName) {
      vCard += `FN:${firstName} ${lastName}\n`;
      vCard += `N:${lastName};${firstName};;;\n`;
    }
    
    if (email) {
      vCard += `EMAIL:${email}\n`;
    }
    
    if (phone) {
      vCard += `TEL:${phone}\n`;
    }
    
    if (organization) {
      vCard += `ORG:${organization}\n`;
    }
    
    if (title) {
      vCard += `TITLE:${title}\n`;
    }
    
    if (address) {
      vCard += `ADR:;;${address};;;;\n`;
    }
    
    if (website) {
      vCard += `URL:${website}\n`;
    }
    
    vCard += 'END:VCARD';
    
    generateQRCode(vCard);
  };

  const downloadQRCode = () => {
    if (!qrCodeImage) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCode = async () => {
    if (!qrCodeImage) return;
    
    try {
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying QR code:', error);
      alert('Error copying QR code. Please try downloading instead.');
    }
  };

  const clearAll = () => {
    setQrCodeData('');
    setQrCodeImage('');
    setUrlData({ url: '', title: '' });
    setTextData('');
    setContactData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organization: '',
      title: '',
      address: '',
      website: ''
    });
  };

  const tabs = [
    { id: 'url', name: 'URL', icon: Link },
    { id: 'text', name: 'Text', icon: FileText },
    { id: 'contact', name: 'Contact', icon: User }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <QrCode className="w-8 h-8 mr-3 text-primary-600" />
              QR Code Generator
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Generate QR codes for URLs, text, and contact information
            </p>
          </div>
          <button
            onClick={clearAll}
            className="btn btn-secondary flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generate QR Code
              </h2>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={urlData.url}
                    onChange={(e) => setUrlData({ ...urlData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={urlData.title}
                    onChange={(e) => setUrlData({ ...urlData, title: e.target.value })}
                    placeholder="My Website"
                    className="input"
                  />
                </div>
                <button
                  onClick={generateURLQR}
                  disabled={isGenerating}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Generate URL QR Code
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Text Tab */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={textData}
                    onChange={(e) => setTextData(e.target.value)}
                    placeholder="Enter any text you want to encode..."
                    rows={6}
                    className="input resize-none"
                  />
                </div>
                <button
                  onClick={generateTextQR}
                  disabled={isGenerating}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Text QR Code
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={contactData.firstName}
                      onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                      placeholder="John"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={contactData.lastName}
                      onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                      placeholder="Doe"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Organization
                    </label>
                    <input
                      type="text"
                      value={contactData.organization}
                      onChange={(e) => setContactData({ ...contactData, organization: e.target.value })}
                      placeholder="Company Inc."
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={contactData.title}
                      onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                      placeholder="Software Engineer"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={contactData.address}
                    onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Link className="w-4 h-4 inline mr-1" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={contactData.website}
                    onChange={(e) => setContactData({ ...contactData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="input"
                  />
                </div>

                <button
                  onClick={generateContactQR}
                  disabled={isGenerating}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Generate Contact QR Code
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* QR Code Display Section */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generated QR Code
              </h2>
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>

            {qrCodeImage ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <img
                      src={qrCodeImage}
                      alt="Generated QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Encoded Data:
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {qrCodeData.length > 100 
                        ? `${qrCodeData.substring(0, 100)}...` 
                        : qrCodeData
                      }
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={downloadQRCode}
                      className="btn btn-primary flex-1 flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={copyQRCode}
                      className="btn btn-secondary flex-1 flex items-center justify-center"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Generate a QR code to see it here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Usage Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">URL QR Codes</h4>
              <p>Perfect for sharing websites, landing pages, or social media profiles. Great for business cards and marketing materials.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Text QR Codes</h4>
              <p>Encode any text content like messages, instructions, or notes. Useful for quick information sharing.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact QR Codes</h4>
              <p>Create vCard QR codes that automatically add contact information to smartphones. Perfect for networking events.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRGenerator;
